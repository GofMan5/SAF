# Contributing to SAF - Stripe Auto Fill

First off, thank you for considering contributing to SAF! It's people like you that make SAF such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible
* **Include your browser version and OS**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript style guide
* End all files with a newline
* Avoid platform-dependent code

## Development Process

### Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/saf-extension.git
```
3. Create a branch:
```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes
2. Test your changes thoroughly:
   - Load extension in developer mode
   - Test on multiple Stripe checkout pages
   - Verify all functionality works
   - Check console for errors

3. Commit your changes:
```bash
git add .
git commit -m "Add: description of your changes"
```

### Commit Message Guidelines

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐛 `:bug:` when fixing a bug
    * ✨ `:sparkles:` when adding a new feature
    * 📝 `:memo:` when writing docs
    * 🚀 `:rocket:` when improving performance
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies
    * 🔧 `:wrench:` when changing configuration files

### Coding Style

* Use 2 spaces for indentation
* Use camelCase for variable and function names
* Use PascalCase for class names
* Use UPPER_CASE for constants
* Add comments for complex logic
* Keep functions small and focused
* Use meaningful variable names
* Avoid magic numbers
* Use template literals for string concatenation

### Testing Checklist

Before submitting your PR, ensure:

- [ ] Code follows the style guidelines
- [ ] No console errors
- [ ] Extension loads without errors
- [ ] All existing features still work
- [ ] New features work as expected
- [ ] Tested on multiple Stripe pages
- [ ] No performance degradation
- [ ] Code is commented where necessary
- [ ] No hardcoded values (use constants)

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with a note describing your changes
3. The PR will be merged once you have the sign-off of a maintainer

## File Structure

```
saf-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Popup UI
├── popup.js          # Popup logic
├── styles.css        # Styles
├── background.js     # Service worker
├── content.js        # Content script
├── icons/           # Extension icons
├── README.md        # Documentation
├── LICENSE          # License file
└── CONTRIBUTING.md  # This file
```

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## Recognition

Contributors will be recognized in the README.md file.

Thank you for contributing! 🎉

