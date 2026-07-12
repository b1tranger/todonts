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
    initial_load_date: "",
    days_passed: 0,
    global_last_synced: ""
  },
  history: [],
  bodyText: "",
  yamlLinesCount: 0,
  undoStack: []
};

// Default Markdown Template
const DEFAULT_MARKDOWN = `---
profile:
  username: "Anonymous"
  total_successes: 42
  initial_load_date: "2026-07-09T15:09:39Z"
  days_passed: 3.0
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
- <[ ]> Don't mindlessly infinite scroll
- [ ] Don't keep time-wasting apps on phone

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
      initial_load_date: "",
      days_passed: 0,
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
        } else if (key === "initial_load_date") {
          data.profile.initial_load_date = val;
        } else if (key === "days_passed") {
          data.profile.days_passed = parseFloat(val) || 0;
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
  lines.push(`  initial_load_date: "${data.profile.initial_load_date || new Date().toISOString()}"`);
  lines.push(`  days_passed: ${data.profile.days_passed !== undefined ? data.profile.days_passed : 0}`);
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

  // 1. Group lines into segments (headings, separators, or general text)
  const segments = [];
  let currentTextSegment = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const globalLineIndex = i + globalLineIndexOffset;

    if (trimmed === "<<hr>>") {
      if (currentTextSegment) {
        segments.push(currentTextSegment);
        currentTextSegment = null;
      }
      segments.push({ type: 'separator', lineIndex: globalLineIndex });
    } else if (line.match(/^(#{1,6})\s+(.*)$/)) {
      if (currentTextSegment) {
        segments.push(currentTextSegment);
        currentTextSegment = null;
      }
      segments.push({ type: 'heading', text: line, lineIndex: globalLineIndex });
    } else {
      if (!currentTextSegment) {
        currentTextSegment = { type: 'text', lines: [] };
      }
      currentTextSegment.lines.push({ text: line, lineIndex: globalLineIndex });
    }
  }

  if (currentTextSegment) {
    segments.push(currentTextSegment);
  }

  // 2. Compile segments to HTML
  let html = "";

  for (let j = 0; j < segments.length; j++) {
    const seg = segments[j];

    if (seg.type === 'heading') {
      const headingMatch = seg.text.match(/^(#{1,6})\s+(.*)$/);
      const level = headingMatch[1].length;
      const headingText = parseInlineMarkdown(headingMatch[2]);
      html += `<h${level}>${headingText}</h${level}>`;
    } else if (seg.type === 'separator') {
      // Separator itself doesn't render any visible rule
      continue;
    } else if (seg.type === 'text') {
      // The text segment is wrapped in a card if preceded or followed by <<hr>>
      const prevSeg = segments[j - 1];
      const nextSeg = segments[j + 1];
      const isCard = (prevSeg && prevSeg.type === 'separator') || (nextSeg && nextSeg.type === 'separator');

      const segmentHtml = compileTextLines(seg.lines, historyData);

      if (isCard) {
        html += `<div class="todont-card">${segmentHtml}</div>`;
      } else {
        html += segmentHtml;
      }
    }
  }

  return html;
}

// Compile individual lines of a text segment into HTML elements
function compileTextLines(linesObj, historyData) {
  let html = "";
  let inList = false;
  let inTable = false;
  let tableRows = [];
  let inParagraph = false;
  let paragraphLines = [];

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

  for (let i = 0; i < linesObj.length; i++) {
    const lineObj = linesObj[i];
    const line = lineObj.text;
    const trimmed = line.trim();
    const globalLineIndex = lineObj.lineIndex;

    // Horizontal Rule
    if (trimmed.match(/^(?:-{3,}|\*{3,}|_{3,})$/) || trimmed === "<hr>") {
      html += closeActiveBlocks();
      html += "<hr>";
      continue;
    }

    // Custom Task Checkboxes
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

      const isPlaceholder = (taskText.trim().toLowerCase() === "don't");
      const placeholderClass = isPlaceholder ? 'show-placeholder' : '';

      if (isChecked) {
        html += `
          <div class="todont-item recurring-constraint checked read-only" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" checked disabled data-line="${globalLineIndex}" data-type="recurring">
              <span class="custom-checkbox recurring"></span>
            </label>
            <span class="task-text ${placeholderClass}" data-placeholder="forgo New Daily Constraint" data-line="${globalLineIndex}">${parseInlineMarkdown(taskText)}${streakHtml}</span>
            <span class="success-badge">Avoided Today</span>
            <button class="delete-task-btn" title="Delete task" data-line="${globalLineIndex}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="todont-item recurring-constraint" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" data-line="${globalLineIndex}" data-type="recurring">
              <span class="custom-checkbox recurring"></span>
            </label>
            <span class="task-text ${placeholderClass}" contenteditable="true" data-placeholder="New Daily Constraint" data-line="${globalLineIndex}">${parseInlineMarkdown(taskText)}</span>${streakHtml}
            <button class="delete-task-btn" title="Delete task" data-line="${globalLineIndex}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
      }
      continue;
    }

    if (persMatch) {
      html += closeActiveBlocks();
      const isChecked = persMatch[1].toLowerCase() === 'x';
      const taskText = persMatch[2];
      const isPlaceholder = (taskText.trim().toLowerCase() === "don't");
      const placeholderClass = isPlaceholder ? 'show-placeholder' : '';

      // Cooldown calculation — only applies when task is CHECKED
      const taskId = slugify(taskText);
      const historyItem = historyData.find(item => item.id === taskId);
      let onCooldown = false;
      let cooldownTimeStr = "";
      if (isChecked && historyItem && historyItem.last_checked) {
        const lastCheckedDate = new Date(historyItem.last_checked);
        const now = new Date();
        const diffMs = now - lastCheckedDate;
        const cooldownMs = 6 * 60 * 60 * 1000; // 6 hours
        if (diffMs < cooldownMs) {
          onCooldown = true;
          const remainingMs = cooldownMs - diffMs;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          cooldownTimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
      }

      const cooldownHtml = onCooldown ? `<span class="cooldown-badge" title="6-hour cooldown active"><i class="fa-solid fa-hourglass-half"></i> Cooldown: ${cooldownTimeStr}</span>` : '';
      const disabledAttr = onCooldown ? 'disabled' : '';

      html += `
        <div class="todont-item persistent-habit ${isChecked ? 'checked' : ''} ${onCooldown ? 'read-only' : ''}" data-line="${globalLineIndex}">
          <label class="checkbox-container">
            <input type="checkbox" ${isChecked ? 'checked' : ''} ${disabledAttr} data-line="${globalLineIndex}" data-type="persistent">
            <span class="custom-checkbox persistent"></span>
          </label>
          <span class="task-text ${placeholderClass}" contenteditable="${isChecked ? 'false' : 'true'}" data-placeholder="continue this New Habit" data-line="${globalLineIndex}">${parseInlineMarkdown(taskText)}</span>
          ${cooldownHtml}
          <button class="delete-task-btn" title="Delete task" data-line="${globalLineIndex}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
      continue;
    }

    if (stdMatch) {
      html += closeActiveBlocks();
      const isChecked = stdMatch[1].toLowerCase() === 'x';
      const taskText = stdMatch[2];
      const isPlaceholder = (taskText.trim().toLowerCase() === "don't");
      const placeholderClass = isPlaceholder ? 'show-placeholder' : '';
      if (isChecked) {
        html += `
          <div class="todont-item standard-task checked read-only" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" checked disabled data-line="${globalLineIndex}" data-type="standard">
              <span class="custom-checkbox"></span>
            </label>
            <span class="task-text ${placeholderClass}" data-placeholder="do this New Task" data-line="${globalLineIndex}">${parseInlineMarkdown(taskText)}</span>
            <button class="delete-task-btn" title="Delete task" data-line="${globalLineIndex}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="todont-item standard-task" data-line="${globalLineIndex}">
            <label class="checkbox-container">
              <input type="checkbox" data-line="${globalLineIndex}" data-type="standard">
              <span class="custom-checkbox"></span>
            </label>
            <span class="task-text ${placeholderClass}" contenteditable="true" data-placeholder="do this New Task" data-line="${globalLineIndex}">${parseInlineMarkdown(taskText)}</span>
            <button class="delete-task-btn" title="Delete task" data-line="${globalLineIndex}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
      }
      continue;
    }

    // Unordered List Items
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

    // Ordered List Items
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

    // Table Rows
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

    // Blockquotes
    const quoteMatch = line.match(/^\s*>\s*(.*)$/);
    if (quoteMatch) {
      html += closeActiveBlocks();
      html += `<blockquote>${parseInlineMarkdown(quoteMatch[1])}</blockquote>`;
      continue;
    }

    // Blank lines
    if (trimmed === "") {
      html += closeActiveBlocks();
      continue;
    }

    // Paragraph content accumulation
    if (inList || inTable) {
      html += closeActiveBlocks();
    }
    if (!inParagraph) {
      inParagraph = true;
      paragraphLines = [];
    }
    paragraphLines.push(trimmed);
  }

  html += closeActiveBlocks();
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
      initial_load_date: new Date().toISOString(),
      days_passed: 0,
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

    let modified = false;
    if (!AppState.profile.initial_load_date) {
      AppState.profile.initial_load_date = new Date().toISOString();
      modified = true;
    }
    if (AppState.profile.days_passed === undefined || isNaN(AppState.profile.days_passed)) {
      const initialDate = new Date(AppState.profile.initial_load_date);
      const diffMs = new Date() - initialDate;
      AppState.profile.days_passed = parseFloat((diffMs / (1000 * 60 * 60 * 24)).toFixed(4)) || 0;
      modified = true;
    }

    if (modified) {
      AppState.rawMarkdown = stringifyYAML({ profile: AppState.profile, history: AppState.history }) + "\n" + AppState.bodyText;
      const rematch = AppState.rawMarkdown.match(yamlRegex);
      AppState.yamlLinesCount = rematch[0].split('\n').length - 1;
    }
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

// Helper: Recalculate days passed since initial load date
function recalculateDaysPassed() {
  if (!AppState.profile.initial_load_date) {
    AppState.profile.initial_load_date = new Date().toISOString();
  }
  let initialDate = new Date(AppState.profile.initial_load_date);
  if (isNaN(initialDate.getTime())) {
    initialDate = new Date();
    AppState.profile.initial_load_date = initialDate.toISOString();
  }
  const now = new Date();
  const diffMs = now - initialDate;
  AppState.profile.days_passed = parseFloat(Math.max(diffMs / (1000 * 60 * 60 * 24), 0).toFixed(4));
}

// Update Header Displays
function updateHeaderStats() {
  // Always recalculate days passed before updating stats
  recalculateDaysPassed();

  const successCountEl = document.getElementById('total-successes-count');
  if (successCountEl) {
    const daysPassedCapped = Math.max(AppState.profile.days_passed, 0.0001);
    const score = (AppState.profile.total_successes / daysPassedCapped).toFixed(2);
    successCountEl.textContent = score;
  }
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) {
    usernameInput.value = AppState.profile.username || "Anonymous";
  }

  // Update modal points and days passed stats
  const modalSuccessesEl = document.getElementById('modal-total-successes');
  const modalDaysPassedEl = document.getElementById('modal-total-days-passed');
  if (modalSuccessesEl) {
    modalSuccessesEl.textContent = AppState.profile.total_successes;
  }
  if (modalDaysPassedEl) {
    modalDaysPassedEl.textContent = AppState.profile.days_passed.toFixed(2);
  }
}

// Helper to replace text beside check box prefixes in markdown lines
function updateMarkdownLineText(lineText, newText) {
  const match = lineText.match(/^(\s*-\s+<<\[[ xX]\]>>\s+)(.*)$/) ||
    lineText.match(/^(\s*-\s+<\[[ xX]\]>\s+)(.*)$/) ||
    lineText.match(/^(\s*-\s+\[[ xX]\]\s+)(.*)$/);
  if (match) {
    return match[1] + newText;
  }
  return lineText;
}

// Helper: Show floating point success indicator
function showFloatingPoints(points, x, y) {
  const element = document.createElement('div');
  element.className = 'floating-points';
  element.textContent = `+${points} Points!`;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  document.body.appendChild(element);

  element.addEventListener('animationend', () => {
    element.remove();
  });
}

// Map to track active cooldown timers
const activeCooldownTimers = new Map();

// Helper: Schedule a push notification for when cooldown completes
function scheduleCooldownNotification(taskId, taskText, delayMs) {
  if (activeCooldownTimers.has(taskId)) {
    clearTimeout(activeCooldownTimers.get(taskId));
  }

  const timerId = setTimeout(() => {
    triggerCooldownCompletedNotification(taskText);
    activeCooldownTimers.delete(taskId);
    renderInteractiveView(); // Refresh visual status
  }, delayMs);

  activeCooldownTimers.set(taskId, timerId);
}

// Helper: Trigger the actual Web Notification
function triggerCooldownCompletedNotification(taskText) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification("To-Don't Cooldown Finished", {
      body: `"${taskText}" is ready to be checked again. Stay strong!`,
      icon: './icon.svg'
    });
  }
}

// Helper: Scan markdown and initialize cooldown notifications
function initCooldownNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const lines = AppState.rawMarkdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const persMatch = line.match(/^\s*-\s+<\[([ xX])\]>\s+(.*)$/);
    if (persMatch) {
      const isChecked = persMatch[1].toLowerCase() === 'x';
      const taskText = persMatch[2];

      if (!isChecked) {
        const taskId = slugify(taskText);
        const historyItem = AppState.history.find(item => item.id === taskId);
        if (historyItem && historyItem.last_checked) {
          const lastCheckedDate = new Date(historyItem.last_checked);
          const now = new Date();
          const diffMs = now - lastCheckedDate;
          const cooldownMs = 6 * 60 * 60 * 1000;
          if (diffMs < cooldownMs) {
            const delayMs = cooldownMs - diffMs;
            scheduleCooldownNotification(taskId, taskText, delayMs);
          }
        }
      }
    }
  }
}

// Undo stack helpers (max 50 snapshots)
const MAX_UNDO_STACK = 50;

function pushUndoSnapshot() {
  AppState.undoStack.push(AppState.rawMarkdown);
  if (AppState.undoStack.length > MAX_UNDO_STACK) {
    AppState.undoStack.shift();
  }
  updateUndoButton();
}

function performUndo() {
  if (AppState.undoStack.length === 0) return;
  AppState.rawMarkdown = AppState.undoStack.pop();
  loadDataFromMarkdown(AppState.rawMarkdown);
  syncSaveState();
  updateEditorTextarea();
  renderInteractiveView();
  updateHeaderStats();
  updateUndoButton();
}

function updateUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (btn) {
    btn.disabled = AppState.undoStack.length === 0;
  }
}

// Scan and reset persistent habits whose 6-hour cooldown has expired
function checkPersistentCooldownResets() {
  let lines = AppState.rawMarkdown.split(/\r?\n/);
  let changed = false;
  const cooldownMs = 6 * 60 * 60 * 1000; // 6 hours
  const now = new Date();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const persMatch = line.match(/^\s*-\s+<\[([xX])\]>\s+(.*)$/);
    if (persMatch) {
      const taskText = persMatch[2];
      const taskId = slugify(taskText);
      const historyItem = AppState.history.find(h => h.id === taskId);
      if (historyItem && historyItem.last_checked) {
        const lastCheckedDate = new Date(historyItem.last_checked);
        const diffMs = now - lastCheckedDate;
        if (diffMs >= cooldownMs) {
          lines[i] = line.replace(/^(\s*-\s+<\[)[xX](\]>\s+.*)$/, '$1 $2');
          changed = true;
        }
      }
    }
  }

  if (changed) {
    AppState.rawMarkdown = lines.join('\n');
    loadDataFromMarkdown(AppState.rawMarkdown);
    syncSaveState();
    updateEditorTextarea();
  }
}

// Render the Interactive UI view
function renderInteractiveView() {
  const container = document.getElementById('interactive-view');
  if (!container) return;

  let parsedHtml = parseMarkdownToHTML(AppState.bodyText, AppState.history, AppState.yamlLinesCount);

  // If parsed HTML has no content, replace with simple description
  const cleaned = parsedHtml.trim();
  if (cleaned === "" || cleaned === "<div class=\"empty-state\"></div>") {
    parsedHtml = `
      <div class="empty-state">
        <p>No tasks rendered. Click "Add Task" below or type in the Live Editor to get started.</p>
      </div>
    `;
  }

  // Append add task trigger button and popup selection menu at the bottom
  parsedHtml += `
    <div class="add-task-outer-container">
      <div class="add-task-container">
        <button id="add-task-trigger" class="add-task-trigger-btn" title="Add Constraint Task">
          <i class="fa-solid fa-plus"></i> Add Task
        </button>
        <div id="add-task-menu" class="add-task-menu hidden">
          <button class="add-menu-item" data-type="standard">
            <span class="custom-checkbox-preview standard"></span> Regular<code>- [ ]</code>
          </button>
          <button class="add-menu-item" data-type="persistent">
            <span class="custom-checkbox-preview persistent"></span> Persistent <code>- &lt;[ ]&gt;</code>
          </button>
          <button class="add-menu-item" data-type="recurring">
            <span class="custom-checkbox-preview recurring"></span> Daily <code>- &lt;&lt;[ ]&gt;&gt;</code>
          </button>
        </div>
      </div>
    </div>
  `;

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
  pushUndoSnapshot();
  const checkbox = e.target;
  const lineIndex = parseInt(checkbox.dataset.line, 10);
  const type = checkbox.dataset.type;
  const checked = checkbox.checked;

  const lines = AppState.rawMarkdown.split(/\r?\n/);
  const lineText = lines[lineIndex];

  let pointsAwarded = 0;

  if (type === 'standard') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+\[)[ xX](\]\s+.*)$/, '$1x$2');
      pointsAwarded = Math.floor(Math.random() * 2) + 1; // 1-2 points
    } else {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+\[)[ xX](\]\s+.*)$/, '$1 $2');
    }

    // Find the boundary of the checkbox chunk containing lineIndex
    const isCheckboxLine = (line) => /^\s*-\s+(?:<<\[[ xX]\]>>|<\[[ xX]\]>|\[[ xX]\])\s+.*$/.test(line);

    let start = lineIndex;
    while (start > 0) {
      const prevLine = lines[start - 1];
      if (isCheckboxLine(prevLine) || prevLine.trim() === '<hr>') {
        start--;
      } else {
        break;
      }
    }

    let end = lineIndex;
    while (end < lines.length - 1) {
      const nextLine = lines[end + 1];
      if (isCheckboxLine(nextLine) || nextLine.trim() === '<hr>') {
        end++;
      } else {
        break;
      }
    }

    // Extract chunk lines
    const chunkLines = lines.slice(start, end + 1);

    // Filter out <hr> from chunkLines, since we will rebuild the <hr> structure
    const filteredChunk = chunkLines.filter(line => line.trim() !== '<hr>');

    // Separate into active and checked standard lines
    const activeLines = [];
    const checkedStandardLines = [];

    for (const line of filteredChunk) {
      if (/^\s*-\s+\[[xX]\]\s+.*$/.test(line)) {
        checkedStandardLines.push(line);
      } else {
        activeLines.push(line);
      }
    }

    // Reassemble chunk
    let newChunkLines = [];
    if (checkedStandardLines.length > 0) {
      newChunkLines = [...activeLines, '<hr>', ...checkedStandardLines];
    } else {
      newChunkLines = [...activeLines];
    }

    // Replace chunk in lines
    lines.splice(start, chunkLines.length, ...newChunkLines);

  } else if (type === 'persistent') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<\[)[ xX](\]>\s+.*)$/, '$1x$2');
      pointsAwarded = Math.floor(Math.random() * 5) + 1; // 1-5 points

      // Extract task name to resolve history last_checked
      const taskTextMatch = lineText.match(/^\s*-\s+<\[[ xX]\]>\s+(.*)$/);
      if (taskTextMatch) {
        const taskText = taskTextMatch[1].trim();
        const taskId = slugify(taskText);
        let historyItem = AppState.history.find(h => h.id === taskId);
        const now = new Date();

        if (!historyItem) {
          historyItem = {
            id: taskId,
            last_checked: now.toISOString()
          };
          AppState.history.push(historyItem);
        } else {
          historyItem.last_checked = now.toISOString();
        }
      }
    } else {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<\[)[ xX](\]>\s+.*)$/, '$1 $2');

      // Schedule cooldown notification if they uncheck it within 6 hours of last check
      const taskTextMatch = lineText.match(/^\s*-\s+<\[[ xX]\]>\s+(.*)$/);
      if (taskTextMatch) {
        const taskText = taskTextMatch[1].trim();
        const taskId = slugify(taskText);
        const historyItem = AppState.history.find(h => h.id === taskId);
        if (historyItem && historyItem.last_checked) {
          const lastCheckedDate = new Date(historyItem.last_checked);
          const now = new Date();
          const diffMs = now - lastCheckedDate;
          const cooldownMs = 6 * 60 * 60 * 1000;
          if (diffMs < cooldownMs) {
            const delayMs = cooldownMs - diffMs;
            scheduleCooldownNotification(taskId, taskText, delayMs);
          }
        }
      }
    }
  } else if (type === 'recurring') {
    if (checked) {
      lines[lineIndex] = lineText.replace(/^(\s*-\s+<<\[)[ xX](\]>>\s+.*)$/, '$1x$2');
      pointsAwarded = Math.floor(Math.random() * 9) + 1; // 1-9 points

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
            if (getLocalDateString(lastCheckedDate) !== getLocalDateString(now)) {
              historyItem.streak = 1;
            }
          }
          historyItem.last_checked = now.toISOString();
        }
      }
      showToast("Awesome! Daily constraint avoided successfully.", "success");
    }
  }

  // Update successes and show floating points if points were awarded
  if (pointsAwarded > 0) {
    AppState.profile.total_successes += pointsAwarded;

    let clickX, clickY;
    if (e.clientX && e.clientY) {
      clickX = e.clientX + window.scrollX;
      clickY = e.clientY + window.scrollY;
    } else {
      const rect = checkbox.getBoundingClientRect();
      clickX = rect.left + window.scrollX + rect.width / 2;
      clickY = rect.top + window.scrollY - 10;
    }
    showFloatingPoints(pointsAwarded, clickX, clickY);
  }

  // Recompile whole raw Markdown
  AppState.rawMarkdown = lines.join('\n');

  // If points were awarded or recurring task was updated, serialize the stats back into the YAML front matter
  if (pointsAwarded > 0 || (type === 'recurring' && checked)) {
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = AppState.rawMarkdown.match(yamlRegex);
    let bodyText = AppState.rawMarkdown;
    if (match) {
      bodyText = AppState.rawMarkdown.substring(match[0].length);
    }
    recalculateDaysPassed();
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
    recalculateDaysPassed();
    const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
    AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;

    // Save state
    syncSaveState();
    showToast("New calendar day detected. Daily constraints reset!", "info");
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
  recalculateDaysPassed();
  const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
  AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;

  // Save, update editor textarea, update status bar
  syncSaveState();
  updateEditorTextarea();
  updateStatusBar();

  // Show center toast
  showToast("Reminder: Export your Markdown file to back up your habits offline!", "info");
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
  recalculateDaysPassed();
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

  showToast("Backup downloaded successfully!", "success");
}

// Import backup parser
function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
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
      initCooldownNotifications();

      showToast("Data imported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Invalid backup file format.", "error");
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
      recalculateDaysPassed();
      const newYamlHeader = stringifyYAML({ profile: AppState.profile, history: AppState.history });
      AppState.rawMarkdown = newYamlHeader + "\n" + bodyText;

      syncSaveState();
      updateEditorTextarea();
    });
  }

  // Points Info Modal Toggle
  const pointsModal = document.getElementById('points-modal');
  const pointsBadge = document.getElementById('points-info-badge');
  const closePointsModalBtn = document.getElementById('close-points-modal');

  if (pointsModal && pointsBadge) {
    pointsBadge.addEventListener('click', () => {
      pointsModal.classList.remove('closed');
    });
  }

  if (pointsModal && closePointsModalBtn) {
    closePointsModalBtn.addEventListener('click', () => {
      pointsModal.classList.add('closed');
    });

    pointsModal.addEventListener('click', (e) => {
      if (e.target === pointsModal) {
        pointsModal.classList.add('closed');
      }
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

  // Clear All Button (removes all body tasks but preserves YAML profile/history)
  const clearAllBtn = document.getElementById('clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all tasks? Your YAML profile metadata and streak history will be preserved.")) {
        pushUndoSnapshot();
        const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
        const match = AppState.rawMarkdown.match(yamlRegex);
        if (match) {
          AppState.rawMarkdown = match[0] + "\n";
        } else {
          AppState.rawMarkdown = "";
        }
        loadDataFromMarkdown(AppState.rawMarkdown);
        renderInteractiveView();
        updateHeaderStats();
        syncSaveState();
        updateEditorTextarea();
      }
    });
  }

  // Undo Button
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', performUndo);
  }

  // Interactive View Task Adding & Editing Event Delegation
  const interactiveView = document.getElementById('interactive-view');
  if (interactiveView) {
    // 0. Click on "x" button to delete task
    interactiveView.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-task-btn');
      if (deleteBtn) {
        pushUndoSnapshot();
        const lineIndex = parseInt(deleteBtn.dataset.line, 10);
        const lines = AppState.rawMarkdown.split(/\r?\n/);

        if (lines[lineIndex] !== undefined) {
          lines.splice(lineIndex, 1);
          AppState.rawMarkdown = lines.join('\n');

          loadDataFromMarkdown(AppState.rawMarkdown);
          renderInteractiveView();
          updateHeaderStats();
          syncSaveState();
          updateEditorTextarea();
        }
        e.stopPropagation();
      }
    });

    // 1. Toggle add task menu
    interactiveView.addEventListener('click', (e) => {
      const trigger = e.target.closest('#add-task-trigger');
      if (trigger) {
        const menu = document.getElementById('add-task-menu');
        if (menu) menu.classList.toggle('hidden');
        e.stopPropagation();
      }
    });

    // 2. Click on menu item to add task
    interactiveView.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.add-menu-item');
      if (menuItem) {
        pushUndoSnapshot();
        const type = menuItem.dataset.type;
        const lines = AppState.rawMarkdown.split(/\r?\n/);

        // Find the index of the last non-empty line
        let lastIndex = lines.length - 1;
        while (lastIndex >= 0 && lines[lastIndex].trim() === "" && lastIndex > AppState.yamlLinesCount) {
          lastIndex--;
        }

        // Find a <hr> divider in the last chunk to insert BEFORE it
        let insertIndex = lastIndex + 1;
        let hrIndex = -1;
        for (let idx = lastIndex; idx >= AppState.yamlLinesCount; idx--) {
          const line = lines[idx].trim();
          if (line === '<hr>') {
            hrIndex = idx;
            break;
          }
          // Stop if we hit a heading or non-checkbox list item (other than empty lines/checkboxes)
          if (line !== "" && !/^\s*-\s+(?:<<\[[ xX]\]>>|<\[[ xX]\]>|\[[ xX]\])\s+.*$/.test(lines[idx])) {
            break;
          }
        }
        if (hrIndex !== -1) {
          insertIndex = hrIndex;
        }

        let newLine = "- [ ] Don't ";
        if (type === 'persistent') {
          newLine = "- <[ ]> Don't ";
        } else if (type === 'recurring') {
          newLine = "- <<[ ]>> Don't ";
        }

        lines.splice(insertIndex, 0, newLine);
        AppState.rawMarkdown = lines.join('\n');

        // Reload and re-render
        loadDataFromMarkdown(AppState.rawMarkdown);
        renderInteractiveView();
        updateHeaderStats();
        syncSaveState();
        updateEditorTextarea();

        // Focus the new task text and place cursor at end
        setTimeout(() => {
          const newEl = document.querySelector(`.task-text[data-line="${insertIndex}"]`);
          if (newEl) {
            newEl.focus();
            const range = document.createRange();
            range.selectNodeContents(newEl);
            range.collapse(false); // collapse to end
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 50);

        e.stopPropagation();
      }
    });

    // 2.5 Focus event on text updates (push undo snapshot before editing starts)
    interactiveView.addEventListener('focus', (e) => {
      if (e.target.classList.contains('task-text') && e.target.hasAttribute('contenteditable')) {
        pushUndoSnapshot();
      }
    }, true);

    // 3. Inline editable text updates on input (silent sync)
    interactiveView.addEventListener('input', (e) => {
      if (e.target.classList.contains('task-text') && e.target.hasAttribute('contenteditable')) {
        const lineIndex = parseInt(e.target.dataset.line, 10);
        const newText = e.target.textContent;

        // Dynamically toggle placeholder visibility
        if (newText.trim().toLowerCase() === "don't") {
          e.target.classList.add('show-placeholder');
        } else {
          e.target.classList.remove('show-placeholder');
        }

        const lines = AppState.rawMarkdown.split(/\r?\n/);

        if (lines[lineIndex] !== undefined) {
          lines[lineIndex] = updateMarkdownLineText(lines[lineIndex], newText);
          AppState.rawMarkdown = lines.join('\n');

          const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
          const match = AppState.rawMarkdown.match(yamlRegex);
          if (match) {
            AppState.bodyText = AppState.rawMarkdown.substring(match[0].length);
          } else {
            AppState.bodyText = AppState.rawMarkdown;
          }

          localStorage.setItem('todont_markdown', AppState.rawMarkdown);
          updateEditorTextarea();
        }
      }
    });

    // 4. Blur event on text updates (recompile full preview)
    interactiveView.addEventListener('blur', (e) => {
      if (e.target.classList.contains('task-text') && e.target.hasAttribute('contenteditable')) {
        loadDataFromMarkdown(AppState.rawMarkdown);
        renderInteractiveView();
        updateHeaderStats();
        syncSaveState();
      }
    }, true); // Capture phase required for blur

    // 5. Keydown handlers (Enter to add, Backspace to delete empty task)
    interactiveView.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('task-text') && e.target.hasAttribute('contenteditable')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          pushUndoSnapshot();

          const lineIndex = parseInt(e.target.dataset.line, 10);
          const lines = AppState.rawMarkdown.split(/\r?\n/);
          const currentLine = lines[lineIndex];

          let newLine = "- [ ] Don't ";
          if (currentLine.includes("- <[")) {
            newLine = "- <[ ]> Don't ";
          } else if (currentLine.includes("- <<[")) {
            newLine = "- <<[ ]>> Don't ";
          }

          lines.splice(lineIndex + 1, 0, newLine);
          AppState.rawMarkdown = lines.join('\n');

          loadDataFromMarkdown(AppState.rawMarkdown);
          renderInteractiveView();
          updateHeaderStats();
          syncSaveState();
          updateEditorTextarea();

          setTimeout(() => {
            const nextEl = document.querySelector(`.task-text[data-line="${lineIndex + 1}"]`);
            if (nextEl) {
              nextEl.focus();
              const range = document.createRange();
              range.selectNodeContents(nextEl);
              range.collapse(false); // collapse to end
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }, 50);
        } else if (e.key === 'Backspace' && e.target.textContent === '') {
          e.preventDefault();
          pushUndoSnapshot();

          const lineIndex = parseInt(e.target.dataset.line, 10);
          const lines = AppState.rawMarkdown.split(/\r?\n/);

          lines.splice(lineIndex, 1);
          AppState.rawMarkdown = lines.join('\n');

          loadDataFromMarkdown(AppState.rawMarkdown);
          renderInteractiveView();
          updateHeaderStats();
          syncSaveState();
          updateEditorTextarea();

          setTimeout(() => {
            const editableSpans = Array.from(document.querySelectorAll('.task-text[contenteditable="true"]'));
            const prevEl = editableSpans.reverse().find(span => parseInt(span.dataset.line, 10) < lineIndex);
            if (prevEl) {
              prevEl.focus();
              const range = document.createRange();
              range.selectNodeContents(prevEl);
              range.collapse(false);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }, 50);
        }
      }
    });
  }

  // Close add task menu when clicking outside
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('add-task-menu');
    const trigger = e.target.closest('#add-task-trigger');
    if (menu && !menu.classList.contains('hidden') && !trigger && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

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

  // Run persistent cooldown resets on boot
  checkPersistentCooldownResets();

  // Request notifications permission on boot
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Initialize scheduled notifications
  initCooldownNotifications();

  // Set up 30-second cooldown checker and UI refresher
  setInterval(() => {
    checkPersistentCooldownResets();

    // Check if user is currently editing a task text
    const activeEl = document.activeElement;
    const isEditing = activeEl && activeEl.classList.contains('task-text') && activeEl.hasAttribute('contenteditable');
    if (!isEditing) {
      renderInteractiveView();
    }
  }, 30 * 1000);

  // Render views
  const editor = document.getElementById('markdown-editor');
  if (editor) {
    editor.value = AppState.rawMarkdown;
  }
  renderInteractiveView();
  updateHeaderStats();
  updateStatusBar();

  // Dismiss preloader with a faded smooth transition
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
      }, 500); // Wait for transition duration (500ms)
    }, 800); // Show splash preloader for 800ms
  }
}

// Boot up app on DOM load completion
document.addEventListener('DOMContentLoaded', boot);
