# ZippyReels Extension - Installation Guide

## ⚡ Quick Start (No Build Required!)

This is a **plain JavaScript browser extension** - no compilation, bundling, or build process needed!

### Chrome / Edge / Brave Installation

1. **Open Extensions Page**
   ```
   chrome://extensions/
   ```
   (or `edge://extensions/` for Edge)

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load the Extension**
   - Click **"Load unpacked"**
   - Navigate to this folder: `/home/nilanj/Desktop/Personal/project/zippyReelsExt`
   - Click **"Select Folder"**

4. **Done!** ✅
   - The extension icon should appear in your toolbar
   - You'll see "Social Media Downloader" in the extensions list

### Firefox Installation

1. **Open Debugging Page**
   ```
   about:debugging#/runtime/this-firefox
   ```

2. **Load Temporary Add-on**
   - Click **"Load Temporary Add-on..."**
   - Navigate to this folder and select `manifest.json`

3. **Note:** Firefox extensions loaded this way are temporary and will be removed when you close Firefox.

---

## 🔧 No Build Process Needed

### Why no `npm install` or `npm run build`?

This extension uses:
- ✅ Plain JavaScript (no TypeScript, no JSX)
- ✅ Plain CSS (no preprocessors)
- ✅ Plain HTML
- ✅ No external dependencies
- ✅ Manifest V3 format

Everything runs directly in the browser - no compilation required!

### If You See npm Errors

```bash
npm ERR! ENOENT: no such file or directory, open '.../package.json'
```

**This is expected!** Browser extensions don't need npm unless you're adding development tools. Just load the extension directly in your browser (see above).

---

## 📦 Optional: Creating a Package for Distribution

If you want to package the extension for sharing:

### Manual ZIP Creation
```bash
cd /home/nilanj/Desktop/Personal/project/zippyReelsExt
zip -r zippyreels.zip . -x '*.git*' -x '*.md' -x 'generate-icons.html' -x 'validate-extension.sh'
```

### Using npm script (if package.json is present)
```bash
npm run package
```

---

## ✅ Verifying the Extension

Run the validation script:
```bash
./validate-extension.sh
```

Expected output:
```
✓ Found manifest.json
✓ manifest.json is valid JSON
✓ All required files are present
```

---

## 🧪 Testing the Extension

### Step 1: Check Extension Loads
1. After loading in browser, check `chrome://extensions/`
2. Look for errors (red text)
3. Extension should show:
   - **Name:** Social Media Downloader
   - **Version:** 1.0.0
   - **ID:** (auto-generated)

### Step 2: Test Popup
1. Click the extension icon in toolbar
2. Should show ethical agreement screen
3. Check the agreement and click "Continue"
4. Should show main interface with History and Settings tabs

### Step 3: Test on Social Media
Visit these sites and check DevTools console (F12):
- **Instagram:** https://www.instagram.com/reels/
- **YouTube:** https://www.youtube.com/shorts/
- **TikTok:** https://www.tiktok.com
- **Twitter/X:** https://twitter.com

Look for initialization messages:
```
Instagram downloader initialized ✓
YouTube downloader initialized ✓
TikTok downloader initialized ✓
Twitter/X downloader initialized ✓
```

### Step 4: Look for Download Buttons
Download buttons should appear on video content (placement varies by platform).

---

## ⚠️ Important Limitations

### Blob URLs
Modern social media platforms (Instagram, TikTok, etc.) use **blob URLs** for streaming video. These cannot be directly downloaded without API access.

**The extension works best for:**
- Your own uploaded content
- Content where creator enabled downloads
- Videos with direct URLs (rare on modern platforms)

### Platform Changes
Social media sites frequently update their HTML/CSS, which may break button placement or detection.

---

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debugging steps.

### Common Issues

**Extension won't load:**
- Ensure Developer mode is enabled
- Check for syntax errors in console
- Verify all files are present

**No download buttons appear:**
- Check browser console for errors (F12)
- Refresh the page after loading extension
- Try a different social media platform

**Buttons appear but don't work:**
- Likely blob URL issue (see limitations above)
- Check browser console for error messages
- Try on your own uploaded content

---

## 📁 File Structure

```
ZippyReelsExt/
├── manifest.json              # Extension configuration
├── background.js              # Background service worker
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup functionality
├── popup.css                  # Popup styles
├── content-instagram.js       # Instagram integration
├── content-youtube.js         # YouTube integration
├── content-twitter.js         # Twitter/X integration
├── content-tiktok.js          # TikTok integration
├── content-styles.css         # Content script styles
└── icons/
    └── ZippyReels.png        # Extension icon
```

---

## 📝 Development

If you want to modify the extension:

1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the **reload icon** on the extension card
4. Test your changes

No build or restart required!

---

## 🚀 Publishing (Optional)

To publish to Chrome Web Store:
1. Create a developer account
2. Package the extension (see above)
3. Upload the ZIP file
4. Fill in store listing details
5. Submit for review

See: https://developer.chrome.com/docs/webstore/publish/

---

## 💬 Need Help?

If the extension still doesn't work after following this guide:
1. Check `chrome://extensions/` for error messages
2. Open browser DevTools (F12) and check Console
3. Run `./validate-extension.sh` to verify files
4. See TROUBLESHOOTING.md for detailed debugging steps
