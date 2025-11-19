// Twitter/X Content Script
// Detects Twitter/X videos and adds download buttons

(function() {
  'use strict';
  
  const PLATFORM = 'twitter';
  let processedTweets = new Set();
  
  init();
  
  function init() {
    console.log('Twitter/X downloader initialized');
    
    // Start observing for tweets with videos
    startObserver();
    
    // Initial scan
    scanForVideos();
  }
  
  // Start MutationObserver for dynamic content
  function startObserver() {
    const observer = new MutationObserver(() => {
      scanForVideos();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Scan for video elements
  function scanForVideos() {
    // Twitter/X uses article elements for tweets
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    
    tweets.forEach(tweet => {
      const tweetId = getTweetId(tweet);
      if (!tweetId || processedTweets.has(tweetId)) return;
      
      const video = tweet.querySelector('video');
      if (video) {
        processedTweets.add(tweetId);
        addDownloadButton(tweet, video);
      }
    });
  }
  
  // Get tweet ID from tweet element
  function getTweetId(tweetElement) {
    // Try to find a link with the tweet ID
    const link = tweetElement.querySelector('a[href*="/status/"]');
    if (link) {
      const match = link.getAttribute('href')?.match(/\/status\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  }
  
  // Add download button to tweet
  function addDownloadButton(tweetElement, videoElement) {
    // Find the actions bar (like, retweet, etc.)
    const actionsBar = tweetElement.querySelector('[role="group"]');
    if (!actionsBar) return;
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'smd-twitter-btn-container';
    buttonContainer.style.cssText = 'display: inline-flex; align-items: center;';
    
    // Create button
    const button = document.createElement('button');
    button.className = 'smd-download-btn smd-twitter-btn';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
    `;
    button.title = 'Download video (only if you have permission)';
    button.setAttribute('aria-label', 'Download');
    
    buttonContainer.appendChild(button);
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDownloadClick(videoElement, button, tweetElement);
    });
    
    // Insert into actions bar
    actionsBar.appendChild(buttonContainer);
  }
  
  // Handle download click
  async function handleDownloadClick(videoElement, button, tweetElement) {
    try {
      // Update button state
      button.disabled = true;
      button.innerHTML = `
        <svg class="smd-spinner" viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
          <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="3" fill="none"/>
        </svg>
      `;
      
      // Extract video URL
      const videoUrl = await extractVideoUrl(videoElement);
      
      if (!videoUrl) {
        throw new Error('Could not extract video URL. This video may be protected.');
      }
      
      // Get username
      const username = extractUsername(tweetElement);
      
      // Get tweet text for filename
      const tweetText = extractTweetText(tweetElement);
      
      // Send download request
      chrome.runtime.sendMessage({
        action: 'download',
        data: {
          url: videoUrl,
          filename: `${tweetText.substring(0, 30)}.mp4`,
          platform: PLATFORM,
          username: username,
          quality: 'best'
        }
      }, (response) => {
        if (response.success) {
          showNotification('✓ Download started!', 'success');
          button.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          `;
          
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = `
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
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
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      `;
    }
  }
  
  // Extract video URL
  async function extractVideoUrl(videoElement) {
    let videoUrl = videoElement.src || videoElement.currentSrc;
    
    // Twitter often uses blob URLs, try to find the actual source
    if (!videoUrl || videoUrl.startsWith('blob:')) {
      // Check source elements
      const source = videoElement.querySelector('source');
      if (source) {
        videoUrl = source.src;
      }
    }
    
    // If still a blob URL, try to get from video poster or network requests
    if (videoUrl && videoUrl.startsWith('blob:')) {
      // In production, you'd need to intercept network requests or use Twitter API
      console.warn('Blob URL detected - may require Twitter API access');
      
      // Try to get from poster attribute (sometimes contains hints)
      const poster = videoElement.poster;
      if (poster && poster.includes('ext_tw_video')) {
        // Extract video ID and construct URL
        const match = poster.match(/\/ext_tw_video\/(\d+)/);
        if (match) {
          // This is a simplified example - actual URL construction may vary
          return poster.replace('/thumb/', '/pu/vid/').replace('.jpg', '.mp4');
        }
      }
      
      return null;
    }
    
    return videoUrl;
  }
  
  // Extract username from tweet
  function extractUsername(tweetElement) {
    const usernameEl = tweetElement.querySelector('[data-testid="User-Name"] a[href^="/"]');
    if (usernameEl) {
      const href = usernameEl.getAttribute('href');
      return href?.split('/')[1] || 'unknown';
    }
    return 'unknown';
  }
  
  // Extract tweet text
  function extractTweetText(tweetElement) {
    const textEl = tweetElement.querySelector('[data-testid="tweetText"]');
    let text = textEl?.textContent?.trim() || 'tweet';
    
    // Sanitize
    text = text.replace(/[<>:"/\\|?*]/g, '_');
    return text.substring(0, 50);
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
      // Find the first visible video
      const videos = document.querySelectorAll('video');
      for (const video of videos) {
        const rect = video.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          const tweet = video.closest('article');
          if (tweet) {
            const button = tweet.querySelector('.smd-twitter-btn');
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
