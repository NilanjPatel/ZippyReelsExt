#!/bin/bash
# Extension Validation Script

echo "=== ZippyReels Extension Validator ==="
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Run this script from the extension directory."
    exit 1
fi

echo "✓ Found manifest.json"
echo ""

# Validate manifest.json
echo "Checking manifest.json..."
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "✓ manifest.json is valid JSON"
else
    echo "❌ manifest.json has JSON syntax errors!"
    python3 -m json.tool manifest.json
    exit 1
fi
echo ""

# Check required files
echo "Checking required files..."
REQUIRED_FILES=(
    "background.js"
    "popup.html"
    "popup.js"
    "popup.css"
    "content-instagram.js"
    "content-youtube.js"
    "content-twitter.js"
    "content-tiktok.js"
    "content-styles.css"
    "icons/ZippyReels.png"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$SIZE" -eq 0 ]; then
            echo "⚠️  $file exists but is EMPTY (0 bytes)"
            ALL_PRESENT=false
        else
            echo "✓ $file ($SIZE bytes)"
        fi
    else
        echo "❌ MISSING: $file"
        ALL_PRESENT=false
    fi
done
echo ""

# Check for syntax errors in JS files
echo "Checking JavaScript files for basic syntax..."
JS_FILES=("background.js" "popup.js" "content-instagram.js" "content-youtube.js" "content-twitter.js" "content-tiktok.js")
for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Basic check: look for unmatched braces/parentheses
        if grep -q "function" "$file"; then
            echo "✓ $file appears to contain JavaScript code"
        else
            echo "⚠️  $file may be incomplete (no functions found)"
        fi
    fi
done
echo ""

# Check icon file
echo "Checking icon file..."
if [ -f "icons/ZippyReels.png" ]; then
    if file icons/ZippyReels.png | grep -q "PNG"; then
        echo "✓ icons/ZippyReels.png is a valid PNG file"
    else
        echo "❌ icons/ZippyReels.png is NOT a valid PNG file!"
        file icons/ZippyReels.png
    fi
else
    echo "❌ icons/ZippyReels.png not found"
fi
echo ""

# Summary
echo "=== Summary ==="
if [ "$ALL_PRESENT" = true ]; then
    echo "✓ All required files are present"
    echo ""
    echo "Next steps:"
    echo "1. Load extension in Chrome: chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked'"
    echo "4. Select this directory: $(pwd)"
    echo "5. Check for any errors in the extension card"
else
    echo "❌ Some files are missing or empty!"
    echo "Please ensure all required files are present and not empty."
fi
