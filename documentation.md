# To-Don't Technical Documentation & Version History

This document outlines the technical architecture, file structure, custom markdown parser specification, and version history of the local-first "To-Don't" Habit Reform Progressive Web App.

---

## 🛠️ Architecture Overview
To-Don't is a single-page application built using vanilla HTML5, CSS3, and ES6+ JavaScript. It operates under a strict privacy-first, offline-ready local model:

- **Data Schema**: Serialization is handled via a YAML Front Matter block prepended to standard Markdown.
- **Persistence**: Saved automatically into browser `localStorage` (key: `todont_markdown`).
- **Offline Utilities**: Static assets are pre-cached using a Cache-First Service Worker.

## 🧠 Project Philosophy

### Cutting Down Noise

The core philosophy of the "To-Don't" project centers on the deliberate subtraction of "noise"—which, in a productivity context, is defined as any low-value task, digital friction, or habitual distraction that dilutes focus and accelerates cognitive burnout. By shifting the emphasis from chasing raw output to actively enforcing boundaries, the application leverages the psychological principle of *via negativa* to protect a user's limited daily reserves of willpower. Rather than succumbing to decision fatigue through constant, real-time resistance, pre-defining what *not* to do automates restraint and transforms deliberate inaction into a visible, dopamine-rewarding victory. Ultimately, by pruning away these deceptive, low-yield habits, the system strips away environmental static so that true intent and high-value creative work have the room to thrive.

## 📁 File Structure
- `index.html` — The main DOM structure, split panes, header controls, mobile hamburger menu, and preloader markup.
- `style.css` — Variables, themes, responsive rules, inline editable text outlines, and checklist item positioning.
- `app.js` — YAML serialization, markdown parser, clock syncing, preloader triggers, and inline task actions.
- `manifest.json` — PWA configuration.
- `sw.js` — Offline caching service worker.
- `icon.svg` — Sleek avoidance logo design.
- `render.html`, `render.css`, `render.js` — Static Markdown reader module themed around To-Don't.

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

### v1.3.0 (Current)
- **Feature**: Full interactive task manager experience. Added an inline `+ Add Task` button with pop-up type selector (Standard, Persistent, or Daily).
- **Feature**: Inline text editing (`contenteditable`) beside checkbox elements with real-time silent editor synchronization.
- **Feature**: Keyboard navigation: **Enter** to insert a new task line of the same type below; **Backspace** on an empty task line to delete the current constraint.
- **Feature**: Hover deletion `x` mark buttons next to list items for quick removal.
- **Feature**: Header-level warning-styled "Clear All" button to flush list items while preserving YAML configuration settings.
- **Feature**: Smooth launch preloader overlay that fades out `800ms` after initialization.
- **Enhancement**: Responsive footer status bar rearranged into a centered flex-wrap grid for mobile viewports.
- **Enhancement**: Word wrapping for long labels to prevent horizontal scrollbars.

### v1.2.0
- **Feature**: Replaced unicode emojis inside headers, buttons, and streak displays with clean vector icons from Font Awesome v6.
- **Feature**: Added a bottom status bar footer linking to the User Guide and Technical Documentation.
- **Enhancement**: Theme integration between the main app and the Markdown reader.

### v1.1.0
- **Feature**: Added Collapsible Editor layout (hidden by default on load).
- **Feature**: Added screen-centering margins for task views when editor is collapsed.
- **Feature**: Implemented responsive top bar and navigation drawer for mobile views.
- **Fix**: Adjusted overflow clipping on the border-floating toggle button.

### v1.0.0
- **Feature**: Initial release of To-Don't PWA.
- **Feature**: YAML parsing and serialization engine.
- **Feature**: Three-tier interactive checklist types.
- **Feature**: 5-minute backup prompt toast overlay.
- **Feature**: Daily resets based on calendar day changes.
