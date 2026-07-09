# To-Don't User Guide

Welcome to **To-Don't**, a local-first, privacy-respecting habit reform companion designed to reinforce mindfulness and restraint.

---

## 💡 The Core Concept
Traditional productivity apps trigger dopamine from *action*, but To-Don't reinforces *restraint*. You build progress by tracking things to avoid or resist.

## 📝 Custom Markdown Syntax
To-Don't lets you write your constraints using standard Markdown syntax inside the editor pane, alongside special interactive widgets:

### 1. Standard Tasks (`- [ ]`)
- **Syntax**: `- [ ] Don't eat fast food`
- **Behavior**: A simple one-time constraint task. When checked in the Interactive View, it strikes through. You can toggle this on and off freely.

### 2. Persistent Habits (`- <[ ]>`)
- **Syntax**: `- <[ ]> Don't check social media before noon`
- **Behavior**: An ongoing constraint. When checked, it strikes through and greys out, but stays active and interactive so you can uncheck it later if needed.

### 3. Daily Recurring Constraints (`- <<[ ]>>`)
- **Syntax**: `- <<[ ]>> Don't drink soda today`
- **Behavior**: A daily commitment. Once checked:
  - It strikes through and turns grey.
  - It becomes **read-only** (disabled) for the rest of the day.
  - It increments your total successes.
  - It starts or increments a daily streak! (e.g. `🔥 5`).
  - It automatically resets to unchecked when the next calendar day begins.

### 4. Rounded Card Blocks (`<<hr>>`)
- **Syntax**: 
  ```markdown
  ## Morning Rules
  <<hr>>
  Stay away from screens for the first hour of the day.
  - <<[ ]>> Don't open phone in bed
  ```
- **Behavior**: Any text content block immediately preceding or following a `<<hr>>` tag (bounded by headings or document edges) is automatically wrapped in a card layout with rounded corners (`border-radius: 12px`).

---

## 🖱️ Interactive Task Manager
To-Don't features a complete interactive checklist interface. While you can always edit constraints in raw Markdown, you can manage your day-to-day checklist purely in the **Active View**:

### 1. Adding Constraints
Click the **`+ Add Task`** button at the bottom of the checklist. A dropdown selector will slide open below the button:
- **Regular**: Adds a Standard Task (`- [ ] Don't `).
- **Persistent**: Adds a Persistent Habit (`- <[ ]> Don't `).
- **Daily**: Adds a Daily Constraint (`- <<[ ]>> Don't `).
Selecting any type automatically appends a new constraint line with a default `"Don't "` prefix, focusing your cursor right after the space. A grayed out placeholder suffix representing the type (`New Task`, `New Habit`, or `New Daily Constraint`) displays after `"Don't "`. This suffix is a visual guide and disappears immediately as you start typing.

### 2. Inline Text Editing
You can click directly on any unchecked checklist label to edit its text.
- As you type, the change is synchronized silently with the Markdown Editor pane and `localStorage`.
- Click away (blur focus) to render any inline Markdown formatting tags (like `*italics*` or `**bold**`).

### 3. Keyboard Shortcuts
While typing inside a checklist label:
- **`Enter`**: Instantly creates a new blank task of the same type directly below the current line and focuses the new input.
- **`Backspace`**: If a label is completely empty, pressing Backspace will delete that checklist line and move your cursor focus to the end of the preceding task.

### 4. Deleting Constraints
- Hovering your cursor over a checklist item reveals a small **`x`** button on the right margin.
- Clicking the `x` button instantly removes the checklist item.

### 5. Clear All
Click the **`Clear All`** button in the header toolbar of the Interactive Tasks pane to wipe out all constraints and start fresh. Your profile username, successes count, and streak history remain safe in your YAML configuration headers.

---

## 💾 Backup & Restore
Since To-Don't is local-first, it does not require a login or any server backends. Your data is stored strictly in your browser's local storage.

### 📤 Export Backup
Click the **Export** button in the header (or desktop navigation) to download your list as a `.md` file. 

### 📥 Import Backup
Click the **Import** button and upload a previously exported `.md` file to restore your username, successes, history, streaks, and constraints.

### 🔔 Backup Reminders
To keep your offline data secure, the app displays a non-intrusive notification toast at the bottom-center of the screen for **5 seconds every 5 minutes** of active use, reminding you to download a backup.

---

## 📅 Daily Resets
When the calendar day flips, the app automatically:
- Resets all daily recurring constraints (`- <<[x]>>`) to unchecked (`- <<[ ]>>`).
- Checks your streak history and resets streaks to `0` for daily constraints that were not successfully avoided on the previous day.
- Updates the sync time in the YAML front matter.
