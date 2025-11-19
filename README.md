# Social Media Downloader Browser Extension

A cross-browser extension for **ethically** downloading social media content from Instagram, YouTube, Twitter/X, and TikTok.

## ⚠️ Important: Ethical Usage

This extension is designed for **legitimate use cases only**:

✅ **Allowed Uses:**
- Downloading your own content for backup purposes
- Downloading content where the creator has explicitly enabled downloads
- Downloading content with proper permission from the creator
- Educational and research purposes with appropriate permissions

❌ **Prohibited Uses:**
- Downloading copyrighted content without permission
- Violating platform terms of service
- Downloading private or protected content
- Redistributing downloaded content without authorization

**You are responsible for ensuring you have the right to download any content.**

## 🎯 Features

- **Multi-Platform Support**: Instagram, YouTube, Twitter/X, TikTok
- **Quality Selection**: Choose from available video quality options
- **Download History**: Track your last 50 downloads
- **Keyboard Shortcuts**: Quick download with Ctrl+Shift+D (Cmd+Shift+D on Mac)
- **Custom Filename Formats**: Configure how files are named
- **Dark/Light Theme**: Match your preference
- **Ethical Warnings**: Built-in reminders about responsible usage

## 🚀 Installation

### Chrome, Edge, and other Chromium browsers

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `social-media-downloader` folder

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the folder

**Note**: For Firefox, this will be temporary. For permanent installation, you'd need to sign it through Mozilla.

## 📖 How to Use

### Method 1: Download Button on Page
1. Navigate to a supported platform (Instagram, YouTube, Twitter/X, TikTok)
2. Find a video you have permission to download
3. Look for the download button that appears on the video
4. Click the button and select your preferred quality
5. The video will download to your browser's download folder

### Method 2: Extension Popup
1. Click the extension icon in your browser toolbar
2. Navigate to a page with downloadable content
3. Click "Quick Download" in the popup
4. The video from the current page will be downloaded

### Method 3: Keyboard Shortcut
1. Navigate to a video you want to download
2. Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
3. The download will begin automatically

### Method 4: Context Menu
1. Right-click anywhere on a page with video content
2. Select "Download with Social Media Downloader"
3. The extension will attempt to download the video

## ⚙️ Settings

Access settings by clicking the extension icon and navigating to the Settings tab:

- **Default Quality**: Choose preferred video quality (Best, 1080p, 720p, 480p, 360p)
- **Auto-Download**: Enable to skip confirmation dialogs
- **Filename Format**: Customize how downloaded files are named
  - `[platform]`: Instagram, YouTube, Twitter, TikTok
  - `[username]`: Content creator's username
  - `[timestamp]`: Date and time of download
- **Theme**: Light, Dark, or Auto (follows system)

## 🔧 Technical Details

### Browser Compatibility
- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (v88+)
- ✅ Brave Browser
- ✅ Firefox (v89+)
- ✅ Opera

### Manifest V3
This extension uses Manifest V3, the latest extension platform specification, ensuring:
- Better security
- Improved privacy
- Enhanced performance
- Future compatibility

### Permissions

The extension requires the following permissions:

- `activeTab`: To detect and interact with the current page
- `downloads`: To save videos to your computer
- `storage`: To save settings and download history
- `contextMenus`: To add right-click menu options
- `host_permissions`: To access content on supported platforms

### File Structure

```
social-media-downloader/
├── manifest.json              # Extension configuration
├── background.js              # Service worker for background tasks
├── popup.html                 # Extension popup interface
├── popup.css                  # Popup styling
├── popup.js                   # Popup functionality
├── content-instagram.js       # Instagram content script
├── content-youtube.js         # YouTube content script
├── content-twitter.js         # Twitter/X content script
├── content-tiktok.js          # TikTok content script
├── content-styles.css         # Styles for injected buttons
├── icons/                     # Extension icons
└── README.md                  # This file
```

## 🚨 Important Limitations

### Platform-Specific Notes

**Instagram:**
- Works with Reels and video posts
- Some videos use blob URLs and may not be downloadable
- Stories may require additional permissions

**YouTube:**
- Works best with your own uploaded videos
- Some videos use DRM or streaming protocols that prevent downloading
- Age-restricted content may not be accessible

**Twitter/X:**
- Works with native video posts
- GIFs and embedded videos are supported
- Protected accounts' content is not accessible

**TikTok:**
- Only works when the creator has enabled downloads
- The extension respects TikTok's download settings
- Some videos may be protected

### Technical Limitations

- **Blob URLs**: Some platforms serve videos as blob URLs, which require additional processing
- **DRM Content**: Protected content cannot be downloaded
- **Live Streams**: Live content is not supported
- **Private Content**: Content from private accounts is not accessible
- **Rate Limits**: Excessive downloading may trigger platform rate limits

## 🛡️ Privacy & Security

- **No Data Collection**: This extension does not collect any user data
- **Local Storage Only**: All settings and history are stored locally in your browser
- **No External Servers**: Downloads happen directly from the platform to your computer
- **No Analytics**: We don't track your usage
- **Open Source**: All code is visible and auditable

## ⚖️ Legal Disclaimer

**IMPORTANT LEGAL NOTICE:**

This extension is provided as-is, for educational and legitimate backup purposes only. By using this extension, you agree that:

1. You will only download content you have the legal right to download
2. You are solely responsible for ensuring compliance with:
   - Platform terms of service
   - Copyright laws in your jurisdiction
   - Intellectual property rights
   - Privacy laws
3. The developers are not responsible for any misuse of this tool
4. You understand that unauthorized downloading may result in:
   - Account suspension or termination
   - Legal action from platforms or content creators
   - Copyright infringement claims

**When in doubt, don't download. Always respect creators' rights.**

## 🤝 Contributing

This is a demonstration project. For production use, consider:

1. Using official platform APIs where available
2. Implementing proper authentication
3. Adding more robust error handling
4. Implementing download queues
5. Adding progress indicators
6. Supporting additional platforms

## 📝 License

This project is for educational purposes. Please ensure you comply with all applicable laws and platform terms of service.

## 📞 Support

If you encounter issues:

1. Ensure you're on a supported platform
2. Check that you have permission to download the content
3. Verify the video is not DRM-protected
4. Try refreshing the page
5. Check browser console for errors

## 🔄 Updates & Maintenance

This extension requires regular updates to maintain compatibility with platform changes. Social media platforms frequently update their code, which may break functionality.

---

## Final Reminder

**Use this tool responsibly. Respect content creators, follow platform rules, and always obtain proper permission before downloading content that isn't yours.**

If you're a content creator and want to protect your work, most platforms offer settings to disable downloads. Please use those official features.

---

Made with ❤️ for ethical content backup and archival.
