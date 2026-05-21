/**
 * Add Real life example callouts to all Network Security lesson files.
 * Run: node server/scripts/inlineRealLifeExamples.js
 */
const fs = require('fs');
const path = require('path');
const {
  inlineRealLifeExamples,
  stripAllRealLifeCallouts,
} = require('../lib/inlineRealLifeExamples');

const lessonsDir = path.join(__dirname, '..', 'seeds', 'lessons');
const manualPath = path.join(__dirname, '..', 'seeds', 'data', 'network-security-manual.md');

let updated = 0;

for (const file of fs.readdirSync(lessonsDir).sort()) {
  if (!file.endsWith('.md')) continue;
  const filePath = path.join(lessonsDir, file);
  let before = fs.readFileSync(filePath, 'utf8');
  if (!/### 2\. Real-World Analogy/i.test(before)) {
    try {
      before = require('child_process').execSync(`git show HEAD:server/seeds/lessons/${file}`, {
        encoding: 'utf8',
        cwd: path.join(__dirname, '../..'),
      });
    } catch {
      /* keep disk copy */
    }
  }
  before = stripAllRealLifeCallouts(before);
  const after = inlineRealLifeExamples(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    updated += 1;
    console.log(`Updated ${file}`);
  }
}

if (fs.existsSync(manualPath)) {
  const before = fs.readFileSync(manualPath, 'utf8');
  const parts = before.split(/\n(?=## \d+\.\d+ )/);
  const rebuilt = parts
    .map((chunk, i) => {
      if (i === 0 && !chunk.match(/^## \d+\.\d+/)) return chunk;
      return inlineRealLifeExamples(chunk);
    })
    .join('\n');
  if (rebuilt !== before) {
    fs.writeFileSync(manualPath, rebuilt, 'utf8');
    console.log('Updated network-security-manual.md');
  }
}

console.log(`Done. ${updated} lesson file(s) changed.`);
