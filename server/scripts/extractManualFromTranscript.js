/**
 * One-time: extract course manual from agent transcript user message.
 * Run: node server/scripts/extractManualFromTranscript.js
 */
const fs = require('fs');
const path = require('path');

const TRANSCRIPT_CANDIDATES = [
  path.resolve(
    __dirname,
    '../../../.cursor/projects/c-Users-Ritik-Desktop-CertNova/agent-transcripts/de4e3f8a-6b08-49c4-87d6-977f45d8b365/de4e3f8a-6b08-49c4-87d6-977f45d8b365.jsonl'
  ),
  'C:/Users/Ritik/.cursor/projects/c-Users-Ritik-Desktop-CertNova/agent-transcripts/de4e3f8a-6b08-49c4-87d6-977f45d8b365/de4e3f8a-6b08-49c4-87d6-977f45d8b365.jsonl',
];

const outManual = path.resolve(__dirname, '../seeds/data/network-security-manual.md');
const outLessonsDir = path.resolve(__dirname, '../seeds/lessons');

const START_MARK = '[ CONFIDENTIALITY ]';
const END_MARK = 'Class dismissed. Go forth and secure the world!';

function extractManualText(raw) {
  const start = raw.indexOf(START_MARK);
  if (start < 0) throw new Error('Manual start marker not found');
  let end = raw.indexOf(END_MARK, start);
  if (end < 0) end = raw.length;
  else end += END_MARK.length;

  let text = raw.slice(start, end).trim();

  const module02 = text.indexOf('# Module 02:');
  if (module02 > 0 && !text.includes('## 1.1 ')) {
    const firstLessonTitle = 'Introduction to Network Security Concepts';
    text = `## 1.1 ${firstLessonTitle}\n\n${text.slice(0, module02).trim()}\n\n${text.slice(module02)}`;
  }

  return text;
}

function resolveTranscriptPath() {
  const extra = path.resolve(
    process.env.USERPROFILE || '',
    '.cursor/projects/c-Users-Ritik-Desktop-CertNova/agent-transcripts/de4e3f8a-6b08-49c4-87d6-977f45d8b365/de4e3f8a-6b08-49c4-87d6-977f45d8b365.jsonl'
  );
  return [...TRANSCRIPT_CANDIDATES, extra].find((p) => p && fs.existsSync(p));
}

function main() {
  const resolved = resolveTranscriptPath();
  if (!resolved) {
    console.error('Transcript file not found.');
    process.exit(1);
  }
  const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/);
  const hit = lines.find((line) => line.includes(START_MARK) && line.includes('user_query'));
  if (!hit) {
    console.error('Could not find user message with manual in transcript.');
    process.exit(1);
  }

  const row = JSON.parse(hit);
  const raw =
    row.message?.content?.find((c) => c.type === 'text')?.text ||
    row.message?.content?.[0]?.text ||
    '';

  const inner = raw.replace(/^<user_query>\s*/i, '').replace(/\s*<\/user_query>\s*$/i, '');
  const manual = extractManualText(inner);

  fs.mkdirSync(path.dirname(outManual), { recursive: true });
  fs.writeFileSync(outManual, manual, 'utf8');
  console.log(`Wrote ${outManual} (${manual.length} chars)`);

  const { parseNetworkSecurityManual } = require('../seeds/parseNetworkSecurityManual');
  const lessons = parseNetworkSecurityManual(manual);
  fs.mkdirSync(outLessonsDir, { recursive: true });
  for (const [num, body] of Object.entries(lessons)) {
    fs.writeFileSync(path.join(outLessonsDir, `${num}.md`), body, 'utf8');
  }
  console.log(`Wrote ${Object.keys(lessons).length} lesson files to ${outLessonsDir}`);
}

main();
