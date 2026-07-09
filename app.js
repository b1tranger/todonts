/**
 * To-Don't App - Core Javascript Engine
 * Local-First, Offline-Ready Habit Reform Application
 */

// Global Application State
const AppState = {
  rawMarkdown: "",
  profile: {
    username: "Anonymous",
    total_successes: 0,
    global_last_synced: ""
  },
  history: [],
  bodyText: "",
  yamlLinesCount: 0
};

// Default Markdown Template
const DEFAULT_MARKDOWN = `---
profile:
  username: "Anonymous"
  total_successes: 42
  global_last_synced: "2026-07-09T15:09:39Z"
history:
  - id: "dont-check-emails-before-noon"
    streak: 12
    last_checked: "2026-07-09T14:46:00Z"
---
# My Constraints
<<hr>>
Keep these boundaries strong today. It is about restraint, not action. Let's make today count.
## The Daily To-Don'ts
- <<[ ]>> Don't check emails before noon
- <[ ]> Avoid mindless infinite scrolling
- [ ] Uninstall time-wasting apps from phone

## General Guidelines
<<hr>>
### Boundaries & Reminders
- Every 5 minutes, the app will remind you to export a local copy of your data.
- Daily constraints (represented by \`<<[ ]>>\`) turn read-only once checked and auto-reset when the next day arrives.
- Persistent habits (\`<[ ]>\`) stay checked until you manually uncheck them.
- Standard tasks (\`[ ]\`) are simple one-off constraints.
`;

// Helper: Slugify text to create IDs for constraints
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Helper: Get local YYYY-MM-DD representation
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Check if date2 is the calendar day after date1
function isYesterday(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2 - d1;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Helper: Check if calendar day has flipped
function hasCalendarDayFlipped(lastSyncedIsoStr) {
  if (!lastSyncedIsoStr) return false;
  try {
    const lastSyncedDate = new Date(lastSyncedIsoStr);
    const currentDate = new Date();
    const lastStr = getLocalDateString(lastSyncedDate);
    const currentStr = getLocalDateString(currentDate);
    return lastStr !== currentStr && currentDate > lastSyncedDate;
  } catch (e) {
    console.error("Error parsing sync date:", e);
    return false;
  }
}

// Custom YAML Parser (No external dependencies)
function parseYAML(yamlContent) {
  const lines = yamlContent.split(/\r?\n/);
  const data = {
    profile: {
      username: "Anonymous",
      total_successes: 0,
      global_last_synced: new Date().toISOString()
    },
    history: []
  };
  
  let currentSection = "";
  let currentHistoryItem = null;
  
  for (let line of lines) {
    line = line.split('#')[0].trimEnd();
    if (!line.trim()) continue;
    
    const rootMatch = line.match(/^([a-zA-Z0-9_-]+)\s*:/);
    if (rootMatch) {
      currentSection = rootMatch[1];
      continue;
    }
    
    if (currentSection === "profile") {
      const fieldMatch = line.match(/^\s+([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      if (fieldMatch) {
        let key = fieldMatch[1];
        let val = fieldMatch[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key === "total_successes") {
          data.profile.total_successes = parseInt(val, 10) || 0;
        } else if (key === "username") {
          data.profile.username = val;
        } else if (key === "global_last_synced") {
          data.profile.global_last_synced = val;
        }
      }
    } else if (currentSection === "history") {
      const listStartMatch = line.match(/^\s*-\s+([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      if (listStartMatch) {
        if (currentHistoryItem) {
          data.history.push(currentHistoryItem);
        }
        currentHistoryItem = {};
        let key = listStartMatch[1];
        let val = listStartMatch[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key === "id") currentHistoryItem.id = val;
        else if (key === "streak") currentHistoryItem.streak = parseInt(val, 10) || 0;
        else if (key === "last_checked") currentHistoryItem.last_checked = val;
      } else {
        const propMatch = line.match(/^\s+([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
        if (propMatch && currentHistoryItem) {
          let key = propMatch[1];
          let val = propMatch[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key === "id") currentHistoryItem.id = val;
          else if (key === "streak") currentHistoryItem.streak = parseInt(val, 10) || 0;
          else if (key === "last_checked") currentHistoryItem.last_checked = val;
        }
      }
    }
  }
  
  if (currentHistoryItem) {
    data.history.push(currentHistoryItem);
  }
  
  return data;
}

// Custom YAML Serializer
function stringifyYAML(data) {
  let lines = ["---"];
  lines.push("profile:");
  lines.push(`  username: "${data.profile.username || "Anonymous"}"`);
  lines.push(`  total_successes: ${data.profile.total_successes || 0}`);
  lines.push(`  global_last_synced: "${data.profile.global_last_synced || new Date().toISOString()}"`);
  
  if (data.history && data.history.length > 0) {
    lines.push("history:");
    for (let item of data.history) {
      lines.push(`  - id: "${item.id}"`);
      if (item.streak !== undefined) {
        lines.push(`    streak: ${item.streak}`);
      }
      if (item.last_checked !== undefined) {
        lines.push(`    last_checked: "${item.last_checked}"`);
      }
    }
  } else {
    lines.push("history: []");
  }
  lines.push("---");
  return lines.join("\n");
}

// Inline Markdown Parser
function parseInlineMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Inline code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return html;
}

// Table Renderer
function renderTable(rows) {
  if (rows.length === 0) return "";
  let html = "<table>";
  let hasHeader = false;
  
  if (rows.length > 1) {
    const secondRowClean = rows[1].replace(/[\s|:-]/g, "");
    if (secondRowClean === "") {
      hasHeader = true;
    }
  }
  
  const parseRowCells = (rowStr) => {
    const parts = rowStr.split("|");
    if (parts.length > 1) {
      if (parts[0].trim() === "") parts.shift();
      if (parts[parts.length - 1] && parts[parts.length - 1].trim() === "") parts.pop();
    }
    return parts.map(cell => parseInlineMarkdown(cell.trim()));
  };
  
  if (hasHeader) {
    html += "<thead><tr>";
    const headerCells = parseRowCells(rows[0]);
    for (const cell of headerCells) {
      html += `<th>${cell}</th>`;
    }
    html += "</tr></thead><tbody>";
    for (let i = 2; i < rows.length; i++) {
      html += "<tr>";
      const cells = parseRowCells(rows[i]);
      for (const cell of cells) {
        html += `<td>${cell}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody>";
  } else {
    html += "<tbody>";
    for (let i = 0; i < rows.length; i++) {
      html += "<tr>";
      const cells = parseRowCells(rows[i]);
      for (const cell of cells) {
        html += `<td>${cell}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody>";
  }
  
  html += "</table>";
  return html;
}

// Main Custom Markdown to HTML Compiler
function parseMarkdownToHTML(bodyText, historyData, globalLineIndexOffset) {
  const lines = bodyText.split(/\r?\n/);
  let html = "";
  
  let inList = false;
  let inTable = false;
  let tableRows = [];
  let inParagraph = false;
  let paragraphLines = [];
  let inCard = false;
  
  function closeActiveBlocks() {
    let blockHtml = "";
    if (inList) {
      blockHtml += `</${inList}>`;
      inList = false;
    }
    if (inTable) {
      blockHtml += renderTable(tableRows);
      tableRows = [];
      inTable = false;
    }
    if (inParagraph) {
      blockHtml += `<p>${parseInlineMarkdown(paragraphLines.join(" "))}</p>`;
      paragraphLines = [];
      inParagraph = false;
    }
    return blockHtml;
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. Visual Card block divider <<hr>>
    if (trimmed === "<<hr>>") {
      html += closeActiveBlocks();
      if (inCard) {
        html += "</div>";
        inCard = false;
      }
      html += '<div class="todont-card">';
      inCard = true;
      continue;
    }
    
    // 2. Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      html += closeActiveBlocks();
      if (inCard) {
        html += "</div>"; // Heading closes the card container
        inCard = false;
      }
      const level = headingMatch[1].length;
      const headingText = parseInlineMarkdown(headingMatch[2]);
      html += `<h${level}>${headingText}</h${level}>`;
      continue;
    }
    
    // 3. Horizontal Rules
    if (trimmed.match(/^(?:-{3,}|\*{3,}|_{3,})$/) || trimmed === "<hr>") {
      html += closeActiveBlocks();
      html += "<hr>";
      continue;
    }
    
    // Global line offset index calculation
    const globalLineIndex = i + globalLineIndexOffset;
    
    // 4. Custom Task Checkboxes
    const recMatch = line.match(/^\s*-\s+<<\[([ xX])\]>>\s+(.*)$/);
    const persMatch = line.match(/^\s*-\s+<\[([ xX])\]>\s+(.*)$/);
    const stdMatch = line.match(/^\s*-\s+\[([ xX])\]\s+(.*)$/);
    
    if (recMatch) {
      html += closeActiveBlocks();
      const isChecked = recMatch[1].toLowerCase() === 'x';
      const taskText = recMatch[2];
      const taskId = slugify(taskText);
      
      const historyItem = historyData.find(item => item.id === taskId);
      const streak = historyItem ? historyItem.streak : 0;
      const streakHtml = streak > 0 ? `<span class="streak-display" title="${streak} day streak"><i class="fa-solid fa-fire"></i> ${streak}</span>` : '';
      
      if (isChecked) {
        html += `
          <div class="todont-item recurring-constraint checked read-only" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" checked disabled data-line="${globalLineIndex}" data-type="recurring">
              <span class="custom-checkbox recurring"></span>
            </label>
            <span class="task-text">${parseInlineMarkdown(taskText)}${streakHtml}</span>
            <span class="success-badge">Avoided Today</span>
          </div>
        `;
      } else {
        html += `
          <div class="todont-item recurring-constraint" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" data-line="${globalLineIndex}" data-type="recurring">
              <span class="custom-checkbox recurring"></span>
            </label>
            <span class="task-text">${parseInlineMarkdown(taskText)}${streakHtml}</span>
          </div>
        `;
      }
      continue;
    }
    
    if (persMatch) {
      html += closeActiveBlocks();
      const isChecked = persMatch[1].toLowerCase() === 'x';
      const taskText = persMatch[2];
      html += `
        <div class="todont-item persistent-habit ${isChecked ? 'checked' : ''}" data-line="${globalLineIndex}">
          <label class="checkbox-container">
            <input type="checkbox" ${isChecked ? 'checked' : ''} data-line="${globalLineIndex}" data-type="persistent">
            <span class="custom-checkbox persistent"></span>
          </label>
          <span class="task-text">${parseInlineMarkdown(taskText)}</span>
        </div>
      `;
      continue;
    }
    
    if (stdMatch) {
      html += closeActiveBlocks();
      const isChecked = stdMatch[1].toLowerCase() === 'x';
      const taskText = stdMatch[2];
      html += `
        <div class="todont-item standard-task ${isChecked ? 'checked' : ''}" data-line="${globalLineIndex}">
          <label class="checkbox-container">
            <input type="checkbox" ${isChecked ? 'checked' : ''} data-line="${globalLineIndex}" data-type="standard">
            <span class="custom-checkbox"></span>
          </label>
          <span class="task-text">${parseInlineMarkdown(taskText)}</span>
        </div>
      `;
      continue;
    }
    
    // 5. Unordered List Items
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (ulMatch) {
      html += closeActiveBlocks();
      if (inList !== 'ul') {
        if (inList) html += `</${inList}>`;
        html += '<ul>';
        inList = 'ul';
      }
      html += `<li>${parseInlineMarkdown(ulMatch[2])}</li>`;
      continue;
    }
    
    // 6. Ordered List Items
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      html += closeActiveBlocks();
      if (inList !== 'ol') {
        if (inList) html += `</${inList}>`;
        html += '<ol>';
        inList = 'ol';
      }
      html += `<li>${parseInlineMarkdown(olMatch[2])}</li>`;
      continue;
    }
    
    // 7. Table Rows Accumulation
    const tableMatch = line.match(/^\s*\|(.*)\|\s*$/);
    if (tableMatch) {
      html += closeActiveBlocks();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
      continue;
    }
    
    // 8. Blockquotes
    const quoteMatch = line.match(/^\s*>\s*(.*)$/);
    if (quoteMatch) {
      html += closeActiveBlocks();
      html += `<blockquote>${parseInlineMarkdown(quoteMatch[1])}</blockquote>`;
      continue;
    }
    
    // 9. Blank Lines
    if (trimmed === "") {
      html += closeActiveBlocks();
      continue;
    }
    
    // 10. Default paragraph line accumulation
    html += closeActiveBlocks();
    if (!inParagraph) {
      inParagraph = true;
      paragraphLines = [];
    }
    paragraphLines.push(trimmed);
  }
  
  html += closeActiveBlocks();
  if (inCard) {
    html += "</div>";
  }
  
  return html;
}

// Core Data Synchronization Pipeline
function loadDataFromMarkdown(markdown) {
  AppState.rawMarkdown = markdown;
  
  const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = markdown.match(yamlRegex);
  
  let yamlText = "";
  if (match) {
    yamlText = match[1];
    AppState.bodyText = markdown.substring(match[0].length);
    AppState.yamlLinesCount = match[0].split('\n').length - 1;
  } else {
    // If front matter is missing, bootstrap it
    AppState.profile = {
      username: "Anonymous",
      total_successes: 0,
      global_last_synced: new Date().toISOString()
    };
    AppState.history = [];
    AppState.bodyText = markdown;
    AppState.yamlLinesCount = 0;
    
    // Prefix YAML
    AppState.rawMarkdown = stringifyYAML({ profile: AppState.profile, history: AppState.history }) + "\n" + markdown;
    
    const rematch = AppState.rawMarkdown.match(yamlRegex);
    AppState.yamlLinesCount = rematch[0].split('\n').length - 1;
  }
  
  if (yamlText) {
    const yamlData = parseYAML(yamlText);
    AppState.profile = yamlData.profile;
    AppState.history = yamlData.history;
  }
}

// Save state to localstorage & update view
function syncSaveState() {
  localStorage.setItem('todont_markdown', AppState.rawMarkdown);
  updateStatusBar();
}

// Update the bottom status bar information
function updateStatusBar() {
  const syncEl = document.getElementById('sync-status-text');
  if (syncEl) {
    const lastSynced = AppState.profile.global_last_synced;
    if (lastSynced) {
      const date = new Date(lastSynced);
      syncEl.textContent = `Last synced: ${date.toLocaleTimeString()}`;
    } else {
      syncEl.textContent = 'Last synced: Never';
    }
  }
}

// Update Header Displays
function updateHeaderStats() {
  const successCountEl = document.getElementById('total-successes-count');
  if (successCountEl) {
    successCountEl.textContent = AppState.profile.total_successes;
  }
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) {
    usernameInput.value = AppState.profile.username || "Anonymous";
  }
}

// Render the Interactive UI view
function renderInteractiveView() {
  const container = document.getElementById('interactive-view');
  if (!container) return;
  
  const parsedHtml = parseMarkdownToHTML(AppState.bodyText, AppState.history, AppState.yamlLinesCount);
  container.innerHTML = parsedHtml;
  
  // Reattach Checkbox Change Listeners
  const checkboxes = container.querySelectorAll('.checkbox-container input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

// Safely update editor value without resetting cursor positions
function updateEditorTextarea() {
  const editor = document.getElementById('markdown-editor');
  if (!editor) return;
  
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const scrollPos = editor.scrollTop;
  
  editor.value = AppState.rawMarkdown;
  
  editor.setSelectionRange(start, end);
  editor.scrollTop = scrollPos;
}

// Checkbox action handler
function handleCheckboxChange(e) {
  const checkbox = e.target;
  const lineIndex = parseInt(checkbox.dataset.line, 10);
  const type = checkbox.dataset.type;
  const checked = checkbox.checked;
  
  const lines = AppState.rawMarkdown.split(/\r?\n/);
  const lineText = lines[lineIndex];
  
  if (type === 'standard') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+\[)[ xX](\]\s+.*)$/, '$1x$2');
    } else {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+\[)[ xX](\]\s+.*)$/, '$1 $2');
    }
  } else if (type === 'persistent') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<\[)[ xX](\]>\s+.*)$/, '$1x$2');
    } else {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<\[)[ xX](\]>\s+.*)$/, '$1 $2');
    }
  } else if (type === 'recurring') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<<\[)[ xX](\]>>\s+.*)$/, '$1x$2');
      
      // Increment successes
      AppState.profile.total_successes += 1;
      
      // Extract task name to resolve history streak
      const taskTextMatch = lineText.match(/^\s*-\s+<<\[[ xX]\]>>\s+(.*)$/);
      if (taskTextMatch) {
        const taskText = taskTextMatch[1].trim();
        const taskId = slugify(taskText);
        let historyItem = AppState.history.find(h => h.id === taskId);
        const now = new Date();
        
        if (!historyItem) {
          historyItem = {
            id: taskId,
            streak: 1,
            last_checked: now.toISOString()
          };
          AppState.history.push(historyItem);
        } else {
          const lastCheckedDate = new Date(historyItem.last_checked);
          if (isYesterday(lastCheckedDate, now)) {
            historyItem.streak += 1;
          } else {
            // If checked today, do nothing. If older, reset streak.
            if (getLocalDateString(lastCheckedDate) !== getLocalDateString(now)) {
              historyItem.streak = 1;
            }
          }
          historyItem.last_checked = now.toISOString();
        }
      }
      showToast("🎉 Awesome! Daily constraint avoided successfully.", "success");
    }
  }
  
  // Recompile whole raw Markdown
  AppState.rawMarkdown = lines.join('\n');
  
  // If recurring task was updated, serialize the altered stats back into the YAML front matter
  if (type === 'recurring' && checked) {
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = AppState.rawMarkdown.match(yamlRegex);
    let bodyText = AppState.rawMarkdown;
    if (match) {
      bodyText = AppState.rawMarkdown.substring(match[0].length);
    }
    const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
    AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;
  }
  
  // Refresh internal data states, save to storage, redraw editor and UI
  loadDataFromMarkdown(AppState.rawMarkdown);
  syncSaveState();
  updateEditorTextarea();
  renderInteractiveView();
  updateHeaderStats();
}

// Day-Flip check and state resetting
function checkDayFlip() {
  const lastSynced = AppState.profile.global_last_synced;
  if (!lastSynced) return;
  
  if (hasCalendarDayFlipped(lastSynced)) {
    let lines = AppState.rawMarkdown.split(/\r?\n/);
    let changed = false;
    
    // 1. Reset all recurring checked tasks back to unchecked
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const recCheckedMatch = line.match(/^(\s*-\s+<<\[)[xX](\]>>\s+.*)$/);
      if (recCheckedMatch) {
        lines[i] = line.replace(/^(\s*-\s+<<\[)[xX](\]>>\s+.*)$/, '$1 $2');
        changed = true;
      }
    }
    
    // 2. Break streaks for daily constraints that were not checked yesterday
    const today = new Date();
    for (let item of AppState.history) {
      const lastCheckedDate = new Date(item.last_checked);
      if (!isYesterday(lastCheckedDate, today) && getLocalDateString(lastCheckedDate) !== getLocalDateString(today)) {
        item.streak = 0;
      }
    }
    
    // 3. Update global last sync time to today
    AppState.profile.global_last_synced = today.toISOString();
    
    // 4. Join and rebuild markdown
    AppState.rawMarkdown = lines.join('\n');
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = AppState.rawMarkdown.match(yamlRegex);
    let bodyText = AppState.rawMarkdown;
    if (match) {
      bodyText = AppState.rawMarkdown.substring(match[0].length);
    }
    const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
    AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;
    
    // Save state
    syncSaveState();
    showToast("📅 New calendar day detected. Daily constraints reset!", "info");
  }
}

// Backup reminder toast trigger
function triggerBackupReminder() {
  // Update timestamp first
  AppState.profile.global_last_synced = new Date().toISOString();
  
  // Re-serialize YAML front matter
  const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = AppState.rawMarkdown.match(yamlRegex);
  let bodyText = AppState.rawMarkdown;
  if (match) {
    bodyText = AppState.rawMarkdown.substring(match[0].length);
  }
  const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
  AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;
  
  // Save, update editor textarea, update status bar
  syncSaveState();
  updateEditorTextarea();
  updateStatusBar();
  
  // Show center toast
  showToast("💾 Reminder: Export your Markdown file to back up your habits offline!", "info");
}

// Toast rendering system
function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconHtml = '<i class="fa-solid fa-bell"></i>';
  if (type === "success") iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  else if (type === "error") iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
  else if (type === "info") iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  
  toast.innerHTML = `
    <span class="toast-icon">${iconHtml}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close-btn" aria-label="Close reminder">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Close handler
  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => {
    toast.style.animation = "toast-out 0.2s ease forwards";
    setTimeout(() => {
      toast.remove();
    }, 200);
  });
  
  // Auto remove after 5 seconds (matching keyframe timings)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}

// Export backup download trigger
function exportBackup() {
  // Update global timestamp
  AppState.profile.global_last_synced = new Date().toISOString();
  
  // Re-serialize YAML
  const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = AppState.rawMarkdown.match(yamlRegex);
  let bodyText = AppState.rawMarkdown;
  if (match) {
    bodyText = AppState.rawMarkdown.substring(match[0].length);
  }
  const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
  AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;
  
  // Save state locally
  syncSaveState();
  updateEditorTextarea();
  updateStatusBar();
  
  // Create download link
  const blob = new Blob([AppState.rawMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const dateStr = getLocalDateString(new Date()).replace(/-/g, '_');
  a.download = `todont_backup_${dateStr}.md`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast("💾 Backup downloaded successfully!", "success");
}

// Import backup parser
function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    try {
      // Validate structure before writing
      loadDataFromMarkdown(text);
      checkDayFlip();
      syncSaveState();
      
      // Update UI Views
      const editor = document.getElementById('markdown-editor');
      if (editor) editor.value = AppState.rawMarkdown;
      renderInteractiveView();
      updateHeaderStats();
      
      showToast("🔄 Data imported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Invalid backup file format.", "error");
    }
  };
  reader.readAsText(file);
  
  // Clear file input
  e.target.value = "";
}

// Theme Engine Initialization & Toggling
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('todont_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('todont_theme', theme);
    if (themeToggleIcon) {
      themeToggleIcon.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
  };
  
  setTheme(getPreferredTheme());
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }
}

// Event Listeners Wire Up
function initAppListeners() {
  // Toggle Editor Button Handler
  const toggleEditorBtn = document.getElementById('toggle-editor-btn');
  const appLayout = document.querySelector('.app-layout');
  const editorPane = document.getElementById('editor-pane');
  if (toggleEditorBtn && appLayout && editorPane) {
    toggleEditorBtn.addEventListener('click', () => {
      const isHidden = appLayout.classList.toggle('editor-hidden');
      if (isHidden) {
        editorPane.classList.add('hidden');
      } else {
        editorPane.classList.remove('hidden');
      }
    });
  }

  // Mobile Hamburger Menu Toggle
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const actionButtons = document.querySelector('.action-buttons');
  if (menuToggleBtn && actionButtons) {
    menuToggleBtn.addEventListener('click', () => {
      menuToggleBtn.classList.toggle('active');
      actionButtons.classList.toggle('active');
    });

    // Close mobile drawer when an action option is clicked
    const drawerButtons = actionButtons.querySelectorAll('.btn, .btn-file-label');
    drawerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        menuToggleBtn.classList.remove('active');
        actionButtons.classList.remove('active');
      });
    });
  }

  // Markdown Editor Typing Sync
  const editor = document.getElementById('markdown-editor');
  if (editor) {
    editor.addEventListener('input', (e) => {
      const content = e.target.value;
      loadDataFromMarkdown(content);
      syncSaveState();
      renderInteractiveView();
      updateHeaderStats();
    });
  }
  
  // Inline Username Editor
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) {
    usernameInput.addEventListener('change', (e) => {
      const newUsername = e.target.value.trim() || "Anonymous";
      AppState.profile.username = newUsername;
      
      // Re-serialize
      const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
      const match = AppState.rawMarkdown.match(yamlRegex);
      let bodyText = AppState.rawMarkdown;
      if (match) {
        bodyText = AppState.rawMarkdown.substring(match[0].length);
      }
      const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
      AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;
      
      syncSaveState();
      updateEditorTextarea();
    });
  }
  
  // File Import Button
  const fileInput = document.getElementById('import-file');
  if (fileInput) {
    fileInput.addEventListener('change', handleImportFile);
  }
  
  // Export Button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBackup);
  }
  
  // Set up 5-minute backup reminder interval
  setInterval(() => {
    triggerBackupReminder();
  }, 5 * 60 * 1000);
}

// PWA Install Prompt wiring
function initPWAPrompts() {
  let deferredPrompt;
  const installBtn = document.getElementById('install-btn');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  });
  
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      installBtn.classList.add('hidden');
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installation accepted by user');
        } else {
          console.log('PWA installation dismissed by user');
        }
        deferredPrompt = null;
      });
    });
  }
  
  window.addEventListener('appinstalled', () => {
    if (installBtn) {
      installBtn.classList.add('hidden');
    }
    showToast("🎉 App installed successfully!", "success");
  });
}

// Register PWA Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('Service Worker registered with scope: ', reg.scope);
          const dot = document.getElementById('sw-status-dot');
          const text = document.getElementById('sw-status-text');
          if (dot) dot.className = "status-dot green";
          if (text) text.textContent = "Offline Ready";
        })
        .catch(err => {
          console.warn('Service Worker registration failed: ', err);
          const dot = document.getElementById('sw-status-dot');
          const text = document.getElementById('sw-status-text');
          if (dot) dot.className = "status-dot yellow";
          if (text) text.textContent = "Offline support disabled";
        });
    });
  } else {
    const dot = document.getElementById('sw-status-dot');
    const text = document.getElementById('sw-status-text');
    if (dot) dot.className = "status-dot red";
    if (text) text.textContent = "Offline unavailable";
  }
}

// App Bootstrapper
function boot() {
  initTheme();
  initAppListeners();
  initPWAPrompts();
  registerServiceWorker();
  
  // Load Markdown data
  const cachedMarkdown = localStorage.getItem('todont_markdown');
  if (cachedMarkdown) {
    loadDataFromMarkdown(cachedMarkdown);
  } else {
    loadDataFromMarkdown(DEFAULT_MARKDOWN);
    syncSaveState();
  }
  
  // Run calendar day checks
  checkDayFlip();
  
  // Render views
  const editor = document.getElementById('markdown-editor');
  if (editor) {
    editor.value = AppState.rawMarkdown;
  }
  renderInteractiveView();
  updateHeaderStats();
  updateStatusBar();
}

// Boot up app on DOM load completion
document.addEventListener('DOMContentLoaded', boot);
