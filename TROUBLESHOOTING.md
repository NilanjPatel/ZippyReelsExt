# Extension Troubleshooting Guide

## Quick Diagnostics

### Step 1: Check Extension Loading
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Look for "Social Media Downloader"
4. Check for any RED error messages

### Step 2: Common Issues

#### Issue: Extension won't load
- **Error: "Manifest file is invalid"**
  - Check that manifest.json has no syntax errors
  - Ensure all file paths in manifest exist

- **Error: "Could not load icon"**
  - Verify icons/ZippyReels.png exists
  - Icon must be a valid PNG file

#### Issue: Extension loads but no download buttons appear
- **Check browser console on social media page:**
  1. Visit Instagram/YouTube/TikTok/Twitter
  2. Press F12 to open DevTools
  3. Go to "Console" tab
  4. Look for errors starting with content script names

- **Content scripts may be blocked by:**
  - Ad blockers
  - Other extensions
  - Browser security policies

#### Issue: Download buttons appear but don't work
- **Check popup console:**
  1. Click extension icon
  2. Right-click on popup → "Inspect"
  3. Look for JavaScript errors

- **Common causes:**
  - Blob URLs (Instagram/TikTok use these - they can't be directly downloaded)
  - Missing permissions
  - Network/CORS issues

### Step 3: Manual Verification

Run this checklist:
- [ ] All files present (see file list below)
- [ ] manifest.json is valid JSON
- [ ] Icons exist and are valid PNG files
- [ ] No errors in chrome://extensions/
- [ ] Extension icon appears in browser toolbar
- [ ] Popup opens when clicking icon
- [ ] Content scripts load on social media pages

### Required Files

```
ZippyReelsExt/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── popup.css
├── content-instagram.js
├── content-youtube.js
├── content-twitter.js
├── content-tiktok.js
├── content-styles.css
└── icons/
    └── ZippyReels.png
```

### Step 4: Test on Simple Page

The extension is designed for:
- Instagram: Reels, Posts with videos
- YouTube: Videos, Shorts
- Twitter/X: Tweets with videos
- TikTok: Videos

**Note:** Many videos on these platforms use blob URLs which cannot be directly downloaded. The extension works best with:
- Your own uploaded content
- Content where the creator has explicitly enabled downloads
- Embedded videos with direct URLs

### Known Limitations

1. **Blob URLs**: Modern social media platforms use blob URLs for security. These cannot be directly downloaded without platform API access.

2. **Platform Changes**: Social media sites frequently update their HTML structure, which may break selectors.

3. **Rate Limiting**: Downloading too many videos quickly may trigger rate limits.

4. **DRM Content**: Protected content cannot be downloaded.

## Getting More Help

If the extension still doesn't work:

1. **Check browser console for errors**
2. **Take screenshots of any error messages**
3. **Note which platform you're testing on**
4. **Describe specifically what happens vs. what you expect**
