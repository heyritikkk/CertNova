const fs = require('fs');
const path = require('path');

/**
 * Parse the full course manual markdown into lesson bodies keyed by "1.1", "2.3", etc.
 */
function parseNetworkSecurityManual(markdown) {
  const lessons = {};
  if (!markdown?.trim()) return lessons;

  const normalized = markdown.replace(/\r\n/g, '\n');
  const lessonChunks = normalized.split(/\n(?=## \d+\.\d+ )/);

  for (const chunk of lessonChunks) {
    const header = chunk.match(/^## (\d+\.\d+) (.+?)(?:\n|$)/);
    if (!header) continue;
    const num = header[1];
    const title = header[2].trim();
    let body = chunk.slice(header[0].length).trim();
    body = body.replace(/^---\s*\n---\s*$/gm, '').trim();
    const hasLessonH1 = new RegExp(`^# ${num.replace('.', '\\.')} `, 'm').test(body);
    if (!hasLessonH1) {
      body = `# ${num} ${title}\n\n${body}`;
    }
    lessons[num] = body;
  }

  return lessons;
}

function loadLessonContentFromDir(dir) {
  const lessons = {};
  if (!fs.existsSync(dir)) return lessons;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const num = file.replace(/\.md$/, '');
    lessons[num] = fs.readFileSync(path.join(dir, file), 'utf8').trim();
  }
  return lessons;
}

function loadAllLessonContent() {
  const lessonsDir = path.join(__dirname, 'lessons');
  const manualPath = path.join(__dirname, 'data', 'network-security-manual.md');

  let lessons = loadLessonContentFromDir(lessonsDir);

  if (fs.existsSync(manualPath)) {
    const fromManual = parseNetworkSecurityManual(fs.readFileSync(manualPath, 'utf8'));
    lessons = { ...fromManual, ...lessons };
  }

  return lessons;
}

module.exports = {
  parseNetworkSecurityManual,
  loadLessonContentFromDir,
  loadAllLessonContent,
};
