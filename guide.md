# To-Don't User Guide

Welcome to **To-Don't**, a local-first, privacy-respecting habit reform companion designed to reinforce mindfulness and restraint.

---

## 💡 The Core Concept
Traditional productivity apps trigger dopamine from *action*, but To-Don't reinforces *restraint*. You build progress by tracking things to avoid or resist.

## 📝 Custom Markdown Syntax
To-Don't lets you write your constraints using standard Markdown syntax inside the editor pane, alongside special interactive widgets:

### 1. Standard Tasks (`- [ ]`)
- **Syntax**: `- [ ] Don't eat fast food`
- **Behavior**: A simple one-time constraint task. When checked, it awards a random amount of success points (+1 to +2 points), strikes through, moves dynamically to the bottom of its checkbox chunk under a `<hr>` divider, and becomes locked (cannot be unchecked in the Interactive View). Unchecking it manually in the editor moves it back up into the active section.

### 2. Persistent Habits (`- <[ ]>`)
- **Syntax**: `- <[ ]> Don't check social media before noon`
- **Behavior**: An ongoing constraint. When checked, it awards +1 to +5 success points, strikes through, greys out, and starts or increments its daily streak count (e.g. `🔥 3`) each time it is checked. A 6-hour cooldown timer badge displays at the top-right corner, and the checkbox is locked (disabled). Once the 6-hour cooldown is over, the task automatically resets to unchecked, becomes active/interactive again, and schedules a browser push notification to alert you. When unchecked, no cooldown timer is shown.

### 3. Daily Recurring Constraints (`- <<[ ]>>`)
- **Syntax**: `- <<[ ]>> Don't drink soda today`
- **Behavior**: A daily commitment. Once checked:
  - It strikes through and turns grey.
  - It becomes **read-only** (disabled) for the rest of the day.
  - It awards a random amount of +1 to +9 success points.
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

## 🏆 Success Point System
To-Don't features a gamified point system to reward restraint. Clicking on the **Successes** badge in the header displays a pop-up sheet detailing the point rules and current statistics:
- **Regular Task (`- [ ]`)**: Awards a random integer between +1 and +2 points on check.
- **Persistent Habit (`- <[ ]>`)**: Awards a random integer between +1 and +5 points on check.
- **Daily Constraint (`- <<[ ]>>`)**: Awards a random integer between +1 and +9 points on check.

When checking a task, a clean floating point indicator animates near your cursor or checkbox showing the point gain. Points are accumulated as lifetime successes.

### 🕒 Balanced Score Calculation
The successes counter displayed in the header is a dynamic score calculated as:
$$\text{Successes Score} = \frac{\text{Total Points Earned} + \text{Total Streaks}}{\text{Total Days Passed} + \text{Active Tasks}}$$

This formula balances your successes by rewarding consistent daily restraint (streaks) while penalizing an excessive backlog of uncompleted habits and tasks. Unless you stay consistent and complete your boundaries, your score will decrease over time.

To track this offline without servers, your profile's YAML front matter automatically records:
- `initial_load_date`: The date and time when your profile was first created.
- `days_passed`: The total fractional days elapsed since the initial load.

You can view your raw successes, active tasks, active streaks, and exact elapsed days anytime inside the **Points Distribution** modal by clicking the trophy successes badge in the header.

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

### 6. Auto-Reordering
Streak-based tasks (Persistent Habits and Daily Recurring Constraints) automatically reorder themselves inside their checklist chunk whenever you check a task. They are sorted in ascending order of their streak counts (lowest streak/highest priority at the top, highest streak/lowest priority at the bottom). This keeps the boundaries you are struggling with at the top of your checklist to maximize focus. Regular tasks (`- [ ]`) don't have streaks, are not sorted, and retain their relative positions in the list.

### 7. Opening the Markdown Canvas
Clicking the toggle arrow button on the right border reveals or hides the raw Markdown Live Editor pane. When unhidden, the canvas automatically scans for a hidden `<!-- TASKS START HERE -->` comment and scrolls the textarea precisely to it. This aligns the view immediately to the first line of your task constraints so you can edit your lists without manual scrolling, regardless of your screen size.

---

## 📱 Progressive Web App (PWA) Features
When installed as a Progressive Web App (PWA), To-Don't runs as a native app and unlocks standalone capabilities:

### 1. Close App & Exit Confirmation
- **"Close App" Button**: An explicit exit button is added inside the mobile responsive sidebar footer.
- **Exit Confirmation**: To prevent accidental closures, attempting to close the app, reload, or press the device's hardware/virtual **Back button** will prompt a `"Cofirm closing window?"` dialog. Confirming will close the app/tab, while canceling will keep it open.

### 2. Background Notifications
- **Every 6 Hours**: It pushes a notification reminding you to avoid a random active (unchecked) constraint from your checklist.
- **Every 24 Hours**: It pushes a summary alert showing the count of outstanding tasks: `"You need to avoid these [total_active_tasks] tasks!"`.

*Note: Background checks sync task states locally using Cache Storage. Notifications require browser notification permissions to be granted.*

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
