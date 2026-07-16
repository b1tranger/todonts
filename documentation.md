# To-Don't Technical Documentation & Version History

This document outlines the technical architecture, file structure, custom markdown parser specification, and version history of the local-first "To-Don't" Habit Reform Progressive Web App.

Repository: https://github.com/b1tranger/todonts

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
  - `- [ ]` $\rightarrow$ Standard task (checked: `- [x]`). When checked, it moves to the bottom of its contiguous checkbox chunk under a `<hr>` divider, awards +1 to +2 success points, and is locked from being unchecked in the Interactive View.
  - `- <[ ]>` $\rightarrow$ Persistent habit (checked: `- <[x]>`). Stays active across days, increments streak on check, and awards +1 to +5 success points. A 6-hour cooldown applies upon checking before it can be checked again, showing a countdown badge and triggering a push notification upon completion.
  - `- <<[ ]>>` $\rightarrow$ Recurring daily constraint (checked: `- <<[x]>>`). Increments streak, awards +1 to +9 success points, and locks to read-only.

---

## 🕒 Version History

### v1.7.0 (Current)
- **Feature**: Task Priority Auto-Reordering. Streak-based tasks (persistent and daily recurring) automatically reorder themselves in ascending order of their streak counts (lowest streak/highest priority at the top) whenever a task is checked. Regular tasks remain unsorted and retain their relative positions.
- **Feature**: Background Constraint Notifications. Integrated background notifications inside the Service Worker. Pushes a random active task reminder every 6 hours and a summary alert of all active tasks every 24 hours. State is shared via a JSON endpoint in Cache Storage.
- **Feature**: Periodic Sync Integration. Configured Periodic Sync query permissions to periodically trigger notification checks from the operating system.
- **Feature**: Live Editor YAML Auto-Scroll. Toggling open the Markdown Live Editor now automatically scrolls the textarea past the YAML Front Matter configuration block using a hidden target marker (`<!-- TASKS START HERE -->`), aligning the viewport immediately to the start of the task constraints.
- **Feature**: PWA Exit Confirmation & Exit Button. When running in PWA standalone mode, the app intercepts back button presses (History API) and window closure to prompt `"Cofirm closing window?"`. Added an explicit "Close App" button inside the mobile responsive sidebar footer.
- **Feature**: Theme-Harmonized Table Rendering. Tables in the Interactive Tasks view are compiled and styled with custom borders, card-matching backgrounds, and theme-neutral hover and zebra striping that look premium in both light and dark themes. Added support for `rowspan` and `colspan` cell merging using `<<^>>` and `<<^^>>` syntaxes.
- **Feature**: Image Embedding & Link Previews. Integrated custom `![alt]\(url\)` parsing: direct image links are displayed as responsive, shadow-framed elements, while standard web links compile into clean preview cards displaying favicon, alt name, domain, and an "Open" trigger.


### v1.6.0
- **Feature**: Balanced Success Score. Successes rating in the header is now calculated as `(Total Points + Total Streaks) / (Days Passed + Active Tasks)`. This balances the points by rewarding consistent task completion streaks and penalizing task hoarding (backlog/active tasks).
- **Feature**: Modal Breakdown Expansion. Added `Total active tasks` and `Total active streaks` rows to the Points modal, alongside a styled formula disclaimer box.
- **Fix**: Persistent habit streaks are now tracked, incremented each time they are checked, and rendered with the same flame/streak icon badge style as daily constraints.

### v1.5.0
- **Feature**: Recalculated Success Score (Time-Decay Rating). The successes counter displayed in the header is now a dynamic rating calculated by dividing the total lifetime successes (points) by the ceiling integer of the elapsed days since the profile was initialized.
- **Feature**: Profile Metadata Tracking. Introduced `initial_load_date` and `days_passed` variables in the profile YAML header to record the timestamp of the first profile load and track elapsed days as fractional values.
- **Feature**: Dynamic Score Decay. Points naturally decay as time passes, encouraging consistent adherence to habit constraints to prevent the successes score from dropping.
- **Feature**: Modal Stats Dashboard. Added total successes (points) and total days passed metrics to the Points Distribution Modal.

### v1.4.1
- **Fix**: Resolved offline loading of markdown documentation and user guide files through the reader page.
- **Feature**: Localized all external CDN dependencies (Marked, DOMPurify, Highlight.js, KaTeX, Font Awesome, and Google Fonts) into a local `dependencies/` directory using an automated Node.js download and font rewriting script.
- **Enhancement**: Implemented automatic fallback loading mechanics for all stylesheets (`onerror` attribute) and scripts (`document.write` checks) in `index.html` and `render.html` to load from the local `dependencies/` folder if CDNs fail.
- **Enhancement**: Updated the Service Worker (`sw.js` and cache name `v28`) to pre-cache both the remote CDN URLs and the localized fallback resources, ensuring total offline resilience.
- **Enhancement**: Updated service worker cache matching to ignore search query parameters (using `{ ignoreSearch: true }`), permitting pages like `render.html?file=guide.md` to load offline.
- **Enhancement**: Implemented dynamic runtime caching for successful GET requests (e.g., dynamically requested webfonts or markdown files).
- **Enhancement**: Added standalone Service Worker registration inside `render.js`.
- **Enhancement**: Unified Font Awesome CDN version link to `6.7.2` across the main dashboard and documentation reader.


### v1.4.0
- **Feature**: Success point system. Award random points on check (Standard: 1–2, Persistent: 1–5, Daily Recurring: 1–9) with a floating "+X Points!" text animation.
- **Feature**: Clickable Successes badge in the header that slides up a points distribution explanation bottom sheet modal.
- **Feature**: Checkbox chunk reordering engine. Checking a standard task (`- [ ]`) moves it to the bottom of its contiguous chunk under a `<hr>` divider.
- **Feature**: Enforced unchecking restrictions. Standard tasks (`- [ ]`) cannot be unchecked from the Interactive View once checked.
- **Feature**: Implemented a 6-hour cooldown on persistent habits (`- <[ ]>`) after checking. Displays a countdown timer badge (`Cooldown: Xh Ym`) and disables the checkbox during the cooldown.
- **Feature**: Push notifications support via Web Notifications API to alert users the moment their habit cooldown expires.
- **Enhancement**: Fixed auto-rotation on mobile devices by locking PWA launch configuration to portrait mode inside `manifest.json`.

### v1.3.1
- **Feature**: Auto-prepended `"Don't "` prefix on adding or inserting checklist items.
- **Feature**: CSS-driven grayed out placeholder suffixes (`New Task`, `New Habit`, `New Daily Constraint`) which hide automatically upon typing.
- **Enhancement**: Fixed light theme contrast using a slate backdrop (`#E2E8F0` / `#F1F5F9`) and pure white cards, resolving the "+ Add Task" button visibility issue.

### v1.3.0
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
