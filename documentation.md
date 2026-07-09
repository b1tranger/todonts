# To-Don't Technical Documentation & Version History

This document outlines the technical architecture, file structure, custom markdown parser specification, and version history of the local-first "To-Don't" Habit Reform Progressive Web App.

---

## 🛠️ Architecture Overview
To-Don't is a single-page application built using vanilla HTML5, CSS3, and ES6+ JavaScript. It operates under a strict privacy-first, offline-ready local model:

- **Data Schema**: Serialization is handled via a YAML Front Matter block prepended to standard Markdown.
- **Persistence**: Saved automatically into browser `localStorage` (key: `todont_markdown`).
- **Offline Utilities**: Static assets are pre-cached using a Cache-First Service Worker.

## 📁 File Structure
- `index.html` — The main DOM structure, split panes, and header controls.
- `style.css` — Variables, themes, responsive rules, and custom checkboxes.
- `app.js` — YAML serialization, markdown parser, clock syncing, and events.
- `manifest.json` — PWA configuration.
- `sw.js` — Offline caching script.
- `icon.svg` — Sleek icon visual asset.
- `render.html`, `render.css`, `render.js` — Static Markdown reader module (used for viewing guides and documentation).

---

## 📋 Markdown Parser Specification
The custom parser split-compiles the document body:
- **Heading block boundaries**: Heading tokens (`#` to `######`) close wrapping layouts.
- **Card Separators (`<<hr>>`)**: Segment-based groupings wrap adjacent text nodes in a `.todont-card` container class.
- **Checkbox Tokenizer**:
  - `- [ ]` $\rightarrow$ Standard task (checked: `- [x]`).
  - `- <[ ]>` $\rightarrow$ Persistent habit (checked: `- <[x]>`).
  - `- <<[ ]>>` $\rightarrow$ Recurring daily constraint (checked: `- <<[x]>>`).

---

## 🕒 Version History

### v1.2.0 (Current)
- **Feature**: Replaced unicode emojis inside headers, buttons, and streak displays with clean vector icons from Font Awesome v6.
- **Feature**: Added a bottom status bar footer linking to the User Guide and Technical Documentation.
- **Enhancement**: Theme integration between the main app and the Markdown reader.

### v1.1.0
- **Feature**: Added Collapsible Editor layout (hidden by default on load).
- **Feature**: Added screen-centering margins for task views when editor is collapsed.
- **Feature**: Implemented responsive top bar and navigation drawer for mobile views.
- **Fix**: Adjusted overflow clipping on the border-floating toggle button.

### v1.0.0
- **Feature**: Initial release of To-Don't Habit Reform PWA.
- **Feature**: YAML parsing and serialization engine.
- **Feature**: Three-tier interactive checklist types.
- **Feature**: 5-minute backup prompt toast overlay.
- **Feature**: Daily resets based on calendar day changes.
