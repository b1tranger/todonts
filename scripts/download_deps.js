const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const DEPS_DIR = path.join(BASE_DIR, 'dependencies');

// Create directories recursively
function makeDirs() {
  const dirs = [
    DEPS_DIR,
    path.join(DEPS_DIR, 'katex'),
    path.join(DEPS_DIR, 'katex', 'fonts'),
    path.join(DEPS_DIR, 'font-awesome'),
    path.join(DEPS_DIR, 'font-awesome', 'css'),
    path.join(DEPS_DIR, 'font-awesome', 'webfonts'),
    path.join(DEPS_DIR, 'highlight'),
    path.join(DEPS_DIR, 'google-fonts')
  ];
  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });
}

// Download helper using https
function downloadFile(url, destPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadFile(response.headers.location, destPath, headers)
          .then(resolve)
          .catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

// Download content to string helper
function fetchString(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        fetchString(response.headers.location, headers)
          .then(resolve)
          .catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: status code ${response.statusCode}`));
        return;
      }
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Main download logic
async function run() {
  console.log('Creating folders...');
  makeDirs();

  const filesToDownload = [
    // Marked
    {
      url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
      dest: path.join(DEPS_DIR, 'marked.min.js')
    },
    // DOMPurify
    {
      url: 'https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js',
      dest: path.join(DEPS_DIR, 'purify.min.js')
    },
    // Highlight JS & CSS
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
      dest: path.join(DEPS_DIR, 'highlight', 'highlight.min.js')
    },
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
      dest: path.join(DEPS_DIR, 'highlight', 'github-dark.min.css')
    },
    // GitHub Markdown CSS
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css',
      dest: path.join(DEPS_DIR, 'github-markdown.min.css')
    },
    // KaTeX JS & CSS
    {
      url: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
      dest: path.join(DEPS_DIR, 'katex', 'katex.min.js')
    },
    {
      url: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js',
      dest: path.join(DEPS_DIR, 'katex', 'auto-render.min.js')
    },
    {
      url: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
      dest: path.join(DEPS_DIR, 'katex', 'katex.min.css')
    },
    // Font Awesome CSS
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
      dest: path.join(DEPS_DIR, 'font-awesome', 'css', 'all.min.css')
    },
    // Font Awesome Webfonts
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-solid-900.woff2',
      dest: path.join(DEPS_DIR, 'font-awesome', 'webfonts', 'fa-solid-900.woff2')
    },
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-regular-400.woff2',
      dest: path.join(DEPS_DIR, 'font-awesome', 'webfonts', 'fa-regular-400.woff2')
    },
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-brands-400.woff2',
      dest: path.join(DEPS_DIR, 'font-awesome', 'webfonts', 'fa-brands-400.woff2')
    }
  ];

  // Add KaTeX fonts
  const katexFonts = [
    'KaTeX_Main-Regular.woff2',
    'KaTeX_Main-Bold.woff2',
    'KaTeX_Main-Italic.woff2',
    'KaTeX_Math-Italic.woff2',
    'KaTeX_Size1-Regular.woff2',
    'KaTeX_Size2-Regular.woff2',
    'KaTeX_Size3-Regular.woff2',
    'KaTeX_Size4-Regular.woff2',
    'KaTeX_AMS-Regular.woff2',
    'KaTeX_Caligraphic-Regular.woff2',
    'KaTeX_Fraktur-Regular.woff2',
    'KaTeX_SansSerif-Regular.woff2',
    'KaTeX_Script-Regular.woff2',
    'KaTeX_Typewriter-Regular.woff2'
  ];
  katexFonts.forEach(font => {
    filesToDownload.push({
      url: `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/${font}`,
      dest: path.join(DEPS_DIR, 'katex', 'fonts', font)
    });
  });

  // Download all files except Google Fonts
  console.log('Downloading libraries and webfonts...');
  for (const item of filesToDownload) {
    try {
      console.log(`Downloading ${path.basename(item.dest)}...`);
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Failed to download ${item.url}:`, err.message);
    }
  }

  // Handle Google Fonts
  console.log('Downloading Google Fonts...');
  const gFontCssUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  try {
    let cssContent = await fetchString(gFontCssUrl);
    
    // Find all urls in cssContent
    const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^\)]+)\)/g;
    let match;
    const fontDownloads = [];
    const urlReplacements = [];

    while ((match = urlRegex.exec(cssContent)) !== null) {
      const fullUrl = match[1];
      const fontFilename = path.basename(new URL(fullUrl).pathname);
      const localFontPath = path.join(DEPS_DIR, 'google-fonts', fontFilename);
      
      fontDownloads.push({ url: fullUrl, dest: localFontPath });
      urlReplacements.push({ remote: fullUrl, local: `./google-fonts/${fontFilename}` });
    }

    // Download Google Font files
    for (const fontItem of fontDownloads) {
      console.log(`Downloading Google Font file ${path.basename(fontItem.dest)}...`);
      await downloadFile(fontItem.url, fontItem.dest);
    }

    // Rewrite Google Fonts CSS to point to local files
    console.log('Rewriting Google Fonts CSS URLs to local path...');
    let rewrittenCss = cssContent;
    for (const rep of urlReplacements) {
      rewrittenCss = rewrittenCss.replaceAll(rep.remote, rep.local);
    }

    fs.writeFileSync(path.join(DEPS_DIR, 'google-fonts.css'), rewrittenCss, 'utf8');
    console.log('Google Fonts CSS saved successfully.');
  } catch (err) {
    console.error('Failed to localize Google Fonts:', err.message);
  }

  console.log('Localization completed successfully!');
}

run().catch(console.error);
