# Installation Guide

Complete guide to installing the Social Media Downloader extension.

## Prerequisites

Before installing, ensure you have:
- A compatible browser (Chrome, Edge, Firefox, or other Chromium-based browsers)
- Basic understanding of browser extensions
- Read and understood the ethical usage guidelines

## Step-by-Step Installation

### For Chrome and Edge

#### Step 1: Download the Extension
1. Download this repository as a ZIP file or clone it using Git:
   ```bash
   git clone https://github.com/yourusername/social-media-downloader.git
   ```
2. If downloaded as ZIP, extract it to a permanent location (don't delete the folder after installation)

#### Step 2: Generate Icons
1. Open `generate-icons.html` in your browser
2. Click the "Download" button under each icon size (16, 32, 48, 128)
3. Save all icons to the `icons/` folder in the extension directory
4. Make sure the filenames are exactly: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

#### Step 3: Load the Extension
1. Open your browser
2. Navigate to the extensions page:
   - **Chrome**: Type `chrome://extensions/` in the address bar
   - **Edge**: Type `edge://extensions/` in the address bar
   - **Brave**: Type `brave://extensions/` in the address bar
   - **Opera**: Type `opera://extensions/` in the address bar

3. Enable "Developer mode":
   - Look for a toggle switch in the top-right corner
   - Turn it ON

4. Click "Load unpacked" button:
   - This button appears after enabling Developer mode
   - It's usually in the top-left corner

5. Select the extension folder:
   - Navigate to where you extracted/cloned the repository
   - Select the `social-media-downloader` folder
   - Click "Select Folder" or "Open"

#### Step 4: Verify Installation
1. The extension should now appear in your extensions list
2. You should see the icon in your browser toolbar
3. Click the icon to verify the popup opens correctly

#### Step 5: Pin the Extension (Recommended)
1. Click the puzzle piece icon in your browser toolbar
2. Find "Social Media Downloader" in the list
3. Click the pin icon to keep it visible in your toolbar

### For Firefox

#### Step 1: Download and Prepare
1. Download or clone the repository (same as Chrome instructions above)
2. Generate icons using `generate-icons.html` (same as Chrome instructions above)

#### Step 2: Load as Temporary Extension
1. Open Firefox
2. Type `about:debugging#/runtime/this-firefox` in the address bar
3. Click "Load Temporary Add-on"
4. Navigate to the extension folder
5. Select the `manifest.json` file
6. Click "Open"

**Note**: In Firefox, temporary extensions are removed when you close the browser. For permanent installation, you need to:
- Package the extension as a .xpi file
- Sign it through Mozilla Add-ons
- Or use Firefox Developer Edition/Nightly with signing disabled

#### Step 3: For Permanent Installation in Firefox
1. Create a Firefox account at https://addons.mozilla.org
2. Submit your extension for review
3. Once approved, it will be permanently installable

### Troubleshooting Installation

#### Issue: "Load unpacked" button is greyed out
**Solution**: Make sure Developer mode is enabled (toggle in top-right corner)

#### Issue: Extension doesn't load
**Solution**: 
- Check that you selected the correct folder (should contain `manifest.json`)
- Verify all files are present
- Check browser console for errors

#### Issue: Icons not showing
**Solution**:
- Make sure you generated all 4 icon sizes
- Verify icons are in the `icons/` folder
- Check that filenames match exactly: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Try reloading the extension

#### Issue: Extension doesn't work on pages
**Solution**:
- Refresh the page after installing the extension
- Check that you're on a supported platform (Instagram, YouTube, Twitter/X, TikTok)
- Verify the extension has necessary permissions
- Check browser console for errors (F12 > Console)

#### Issue: Downloads don't start
**Solution**:
- Check browser download permissions
- Verify you have permission to download the content
- Ensure the video is not DRM-protected
- Try a different video

## Post-Installation Setup

### 1. Read Ethical Agreement
- On first use, you'll see an ethical usage agreement
- Read it carefully
- Check the agreement box
- Click "Continue"

### 2. Configure Settings
1. Click the extension icon in your toolbar
2. Go to the "Settings" tab
3. Configure your preferences:
   - **Default Quality**: Choose your preferred video quality
   - **Auto-Download**: Enable for automatic downloads
   - **Filename Format**: Choose how files are named
   - **Theme**: Select Light, Dark, or Auto

4. Click "Save Settings"

### 3. Test the Extension
1. Navigate to a supported platform
2. Find a video you have permission to download (ideally your own content)
3. Look for the download button on the video
4. Click it to test the download

### 4. Learn Keyboard Shortcuts
- **Quick Download**: `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
- This works when viewing a video on a supported platform

## Updating the Extension

When updates are available:

### Method 1: Manual Update
1. Download the latest version
2. Extract to the same location (replace old files)
3. Go to your browser's extensions page
4. Click the refresh icon on the extension card

### Method 2: Reload Extension
1. Go to extensions page
2. Find Social Media Downloader
3. Click "Reload" or the circular arrow icon
4. Extension will reload with new changes

## Uninstalling the Extension

If you need to remove the extension:

1. Go to your browser's extensions page
2. Find "Social Media Downloader"
3. Click "Remove" or the trash icon
4. Confirm removal
5. Optionally delete the extension folder from your computer

## Security Notes

- Only install extensions from trusted sources
- This extension does not collect any data
- All processing happens locally in your browser
- No external servers are contacted for downloads
- Settings are stored locally in your browser

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Read the main README.md file
3. Check browser console for errors (F12 > Console)
4. Verify you're following ethical usage guidelines
5. Ensure you have permission to download the content

## Legal Reminder

By installing this extension, you agree to:
- Use it only for legal purposes
- Respect copyright and intellectual property rights
- Follow all platform terms of service
- Only download content you have permission to download

**When in doubt, don't download.**

---

Congratulations! You should now have the Social Media Downloader extension installed and ready to use responsibly.
