# SAF Extension Structure

## 📁 File Organization

### Core Files
- **manifest.json** - Extension configuration and permissions
- **background.js** - Background service worker
- **popup.html** - Extension popup interface
- **popup.js** - Popup logic and UI controls
- **styles.css** - All styles for popup
- **translations.json** - Multi-language support

### Content Scripts (Auto-injected)

#### Stripe Module
**Files:** `dataGenerator.js` + `content.js`
- **Injected on:** `https://checkout.stripe.com/*`, `https://*.stripe.com/*`
- **Purpose:** Auto-fill Stripe payment forms
- **Features:**
  - Card number generation with Luhn validation
  - Random address generation
  - Billing info auto-fill
  - IP blocking for 3DS challenges

#### Cursor Module  
**File:** `cursorRegistration.js`
- **Injected on:** `https://cursor.com/*`, `https://authenticator.cursor.sh/*`
- **Purpose:** Automate Cursor.com registration
- **Features:**
  - Auto-navigate to registration page
  - Fill first name, last name, email
  - Save credentials to storage
  - Smart form detection

## 🔄 How It Works

### Stripe Auto-Fill Flow
1. User clicks "Fill Everything" in popup
2. `popup.js` sends message to `content.js`
3. `content.js` detects form fields
4. `dataGenerator.js` generates random data
5. Form is filled automatically

### Cursor Registration Flow
1. User clicks "Start Registration" in popup
2. `popup.js` opens `https://cursor.com/dashboard`
3. Dashboard redirects to `authenticator.cursor.sh`
4. `cursorRegistration.js` waits for page load
5. Finds "Sign Up" link and clicks it
6. Fills registration form with generated data
7. Saves credentials to chrome.storage

## 🎯 Key Features

### Separation of Concerns
- **Stripe logic** isolated in `content.js`
- **Cursor logic** isolated in `cursorRegistration.js`
- **No conflicts** between different site scripts

### Smart Loading
- Scripts only load on relevant domains
- Reduced memory footprint
- Faster performance

### Error Handling
- Comprehensive logging with `[SAF]` and `[SAF Cursor]` prefixes
- Visual notifications for user feedback
- Graceful fallbacks

## 🔧 Debugging

### Console Logs
- **Stripe:** Look for `[SAF]` prefix
- **Cursor:** Look for `[SAF Cursor]` prefix
- **IP Blocker:** Look for `[SAF IP Blocker]` prefix

### Storage
```javascript
// View stored credentials
chrome.storage.local.get(['lastCursorCredentials'], (r) => console.log(r));

// View generated cards
chrome.storage.local.get(['generatedCards'], (r) => console.log(r));

// View blocked IPs
chrome.storage.local.get(['blockedIPs'], (r) => console.log(r));
```

## 📝 Adding New Features

### For Stripe
Edit `content.js` - all Stripe logic is there

### For Cursor
Edit `cursorRegistration.js` - all Cursor logic is there

### For Popup UI
Edit `popup.html` + `popup.js` + `styles.css`

## 🚀 Deployment

1. Make changes to files
2. Reload extension in `chrome://extensions/`
3. Test on target sites
4. Check console for errors

---

**Version:** 1.2  
**Last Updated:** 2025-11-10
