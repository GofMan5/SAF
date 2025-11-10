# SAF - Stripe Auto Fill

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/GofMan5/saf-extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A Chrome extension for automatic filling of Stripe checkout forms with customizable card generation, address management, and modern dark UI.

## Features

- 🚀 **One-Click Auto-Fill** - Fill entire Stripe checkout forms instantly
- 💳 **Smart Card Generation** - Generate valid test cards with Luhn algorithm
- 🎨 **Modern UI** - Sleek interface with neon accents
- 🔒 **Card Validation** - Optional Luhn validation for realistic cards
- 🏠 **Address Management** - Multiple address sources (static/manual/auto)
- 👤 **Name Management** - Flexible name generation options
- 🤖 **Auto-Generation** - Generate realistic random names and addresses for all 50 US states
- 📦 **Local Storage** - All data stored locally in browser
- ⚡ **Fast Performance** - No external dependencies
- 🎯 **BIN History** - Quick access to recently used BINs

## Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/GofMan5/saf-extension.git
cd saf-extension
```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

3. Done! The extension icon should appear in your toolbar

## Usage

### Quick Start

1. Open any Stripe checkout page
2. Click the SAF extension icon
3. (Optional) Enter a custom BIN or use default
4. Click "🚀 Fill Everything"
5. Form will be automatically filled

### Settings Configuration

Access settings by clicking the ⚙️ icon in the extension popup:

#### Card Validation
- **Enabled**: Generate only Luhn-valid card numbers
- **Disabled**: Generate cards faster without validation

#### Address Source
- **Static**: Use built-in default addresses
- **Manual**: Use addresses you've added in Settings tab
- **Auto**: Automatically generate random realistic USA addresses (all 50 states)

#### Name Source
- **Static**: Use built-in default names
- **Manual**: Use custom names from Settings tab
- **Auto**: Automatically generate random realistic names (taken from addresses)

### Clearing Data

Click the "🗑️ Clear All Data" button on Stripe checkout pages to:
- Clear all cookies
- Clear localStorage
- Clear sessionStorage
- Clear cache
- Reload the page

## Features in Detail

### Card Generation

- Supports BIN templates (e.g., `552461`)
- Auto-fills with 'x' to 16 digits
- Supports cards up to 19 digits
- Generates realistic expiry dates (future dates)
- Generates valid CVV codes
- Detects card types (Visa, Mastercard, Amex, etc.)

### BIN Management

- Save frequently used BINs
- Quick history access
- Click to load saved BIN
- Persistent storage across sessions

### Address Management

Add custom addresses with:
- Full name
- Address line 1 & 2
- City
- State
- ZIP code
- Country (auto-detected)

### Name Management

Add custom names with:
- First name
- Last name
- Quick selection from list

## Technical Details

### Manifest V3

This extension uses Manifest V3 for improved security and performance.

### Permissions

- `storage`: Store settings and data locally
- `activeTab`: Access current tab for form filling
- `tabs`: Manage Stripe checkout tabs
- `scripting`: Inject content scripts
- `cookies`: Clear cookies on user request
- `browsingData`: Clear browsing data

### Architecture

```
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.js          # Popup logic
├── styles.css        # Dark theme styles
├── background.js     # Service worker (card generation)
├── content.js        # Content script (form filling)
└── icons/           # Extension icons
```

## Development

### Project Structure

**background.js**: Service worker handling:
- Card number generation with Luhn algorithm
- BIN validation
- Data persistence
- Browsing data management

**content.js**: Content script handling:
- Form field detection
- Auto-fill logic
- Shadow DOM support
- Address/name management

**popup.js**: Extension popup handling:
- UI interactions
- Settings management
- Tab switching
- Data display

### Building

No build process required. The extension runs directly from source files.

### Testing

1. Load extension in developer mode
2. Open a Stripe test checkout page
3. Test auto-fill functionality
4. Verify data persistence
5. Check settings functionality

## Privacy

- All data stored locally in browser
- No external API calls
- No data collection
- No tracking
- No telemetry

## Compatibility

- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## Known Issues

- BIN List tab: Currently shows "Coming Soon" placeholder

## Roadmap

- [x] Add automatic address generation (USA - all 50 states)
- [x] Add automatic name generation (realistic male/female names)
- [ ] Export/import settings
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Email generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

**This extension is for testing purposes only.** Use only with test cards and test Stripe accounts. Do not use with real payment information.

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Changelog

### Version 1.1.0 (Current)
- ✨ **NEW**: Auto-generation of realistic names (male/female)
- ✨ **NEW**: Auto-generation of addresses for all 50 US states
- ✨ **NEW**: Support for 1000+ real US cities
- Card generation with Luhn validation
- Address and name management
- Dark theme UI
- BIN history
- Settings panel
- Clear data functionality

### Version 1.0.0
- Initial release
- Basic card generation
- Manual address management

## Author

Maksim - [@GofMan5](https://github.com/GofMan5)
tg - @GofMan5

## Acknowledgments

- Stripe for checkout form structure
- Chrome Extension community for best practices
