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
- **Syntax**: `- <[ ]> Avoid checking social media before noon`
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
