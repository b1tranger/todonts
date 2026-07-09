# To-Don't — Habit Reform PWA

To-Don't is a local-first, privacy-respecting Progressive Web App (PWA) designed to reinforce mindfulness, boundary-setting, and restraint. While traditional todo apps reward output, To-Don't leverages the psychological principle of *via negativa* to help you define, tracks, and maintain your boundaries.

🌐 **Live Website Link**: [b1tranger.bro.bd/todonts/](http://b1tranger.bro.bd/todonts/)

---

## 🧠 Project Philosophy: Cutting Down Noise
The core philosophy of the "To-Don't" project centers on the deliberate subtraction of "noise"—defined as low-value tasks, digital distractions, or habits that accelerate cognitive burnout. Pre-defining what *not* to do automates restraint and transforms deliberate inaction into a visible, rewarding victory, protecting your limited reserves of daily willpower.

---

## 🚀 Key Features

1. **Bi-directional Live Syncing**:
   - Updates the markdown editor in real time when you edit or check items in the interactive view.
   - Synchronizes raw markdown changes instantly back to the active list view without losing input focus.
2. **Three-Tier Task Logic**:
   - **Standard Task (`- [ ] Don't`)**: A simple one-time constraint that strikes through when checked.
   - **Persistent Habit (`- <[ ]> Don't`)**: Ongoing boundaries that stay active across days so you can check and uncheck them.
   - **Daily Recurring Constraint (`- <<[ ]>> Don't`)**: A commitment that locks to read-only when checked today, increments your total successes and fire streak (`🔥`), and automatically resets tomorrow.
3. **Automatic "Don't" Suffix Placeholders**:
   - Adding or inserting new checklist lines automatically formats them with a default `"Don't "` prefix.
   - A grayed-out placeholder suffix (`New Task`, `New Habit`, or `New Daily Constraint`) is rendered via CSS if the text consists only of the `"Don't "` prefix, disappearing immediately as you type.
4. **Rounded Card Layouts (`<<hr>>`)**:
   - Group text nodes and constraints inside rounded card layouts block-by-block using the `<<hr>>` tag.
5. **Offline & Installation Ready**:
   - Service worker caches all static assets for offline usage.
   - App Install prompt banner is integrated into the drawer drawer menu on mobile viewports.

---

## 📂 Codebase Architecture
- [index.html](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/index.html) — App structure, split-pane viewports, and toast notices.
- [style.css](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/style.css) — Theme variables (with high contrast light slate and dark themes), preloader animations, and layout structures.
- [app.js](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/app.js) — The engine running YAML/Markdown parsers, theme settings, local storage, calendar checkers, and click handlers.
- [guide.md](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/guide.md) — Comprehensive user guide on avoiding habits and managing cards.
- [documentation.md](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/documentation.md) — System specifications and full version releases.
- [render.html](file:///c:/Users/gsmur/Documents/GitHub/[personal]/todonts/render.html) — Static document reader used to preview user guides and system documentation.
