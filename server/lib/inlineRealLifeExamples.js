/**
 * Lesson layout (4 sections):
 * 1. Core Technical Breakdown — explanations only
 * 2. Real-World Analogy — each bullet followed by a Real life example callout
 * 3. Attack & Defense Lab Scenario — each bullet followed by a Real life example callout
 * 4. Professor's Deep-Dive Notes — Professor's Tip (unchanged)
 */

const SECTION2_RE = /### 2\. Real-World Analogy\s*\n/i;
const SECTION3_RE = /### 3\. Attack/i;
const SECTION4_RE = /### 4\./i;
const LABELED_BULLET_RE = /^\* \*\*([^*]+)\*\*:?\s*(.*)$/;
const SECTION3_BULLET_RE =
  /^\* \*\*((?:The )?(?:Attack|Defense|Violation|Remediation|Incident|Pen Test|Execution)[^*]*)\*\*:?\s*(.*)$/i;

function normalizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(attacks?|threats?|encryption)$/i, '')
    .replace(/\s+/g, ' ');
}

function parseLabeledBullets(text) {
  const items = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '').trimEnd();
    const m = line.match(LABELED_BULLET_RE);
    if (m) {
      if (current) items.push(current);
      current = {
        label: m[1].trim().replace(/:+$/, ''),
        body: (m[2] || '').trim(),
      };
      continue;
    }
    if (current && line.trim() && !line.startsWith('###') && !line.startsWith('```')) {
      current.body += (current.body ? ' ' : '') + line.trim();
    }
  }
  if (current) items.push(current);
  return items;
}

function formatExampleText(label, body, leadIn) {
  let text = body.trim();
  if (!text) return '';
  if (/^(is|are|ensures|was|means|would|can)\b/i.test(text)) {
    text = `**${label.replace(/:+$/, '')}** ${text}`;
  }
  if (leadIn && !text.toLowerCase().includes(leadIn.slice(0, 24).toLowerCase())) {
    text = `${leadIn} ${text}`;
  }
  return text;
}

function formatCallout(text, leadIn = '') {
  const body = leadIn ? formatExampleText('', text, leadIn) : text.trim();
  if (!body) return '';
  return `\n  > *Real life example:* ${body}\n`;
}

function pushCalloutLines(out, callout) {
  for (const calloutLine of callout.replace(/^\n/, '').split('\n')) {
    if (calloutLine.length) out.push(calloutLine);
  }
}

function insertCalloutsAfterBullets(text, { leadIn = '', matchBullet } = {}) {
  const lines = text.split('\n');
  const out = [];
  let usedLeadIn = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);

    const m = line.match(matchBullet || LABELED_BULLET_RE);
    if (!m) continue;

    const body = (m[2] || '').trim();
    if (!body) continue;

    const nextChunk = lines.slice(i + 1, i + 6).join('\n');
    if (/Real life example/i.test(nextChunk)) continue;

    const label = (m[1] || '').trim().replace(/:+$/, '');
    const exampleText =
      matchBullet === SECTION3_BULLET_RE
        ? body
        : formatExampleText(label, body, !usedLeadIn && leadIn ? leadIn : '');

    const callout = formatCallout(exampleText);
    pushCalloutLines(out, callout);
    if (leadIn && !usedLeadIn) usedLeadIn = true;
  }

  return out.join('\n');
}

function stripCalloutsFromSection1(beforeSection2) {
  const lines = beforeSection2.split('\n');
  const out = [];
  let skipBlockquote = false;

  for (const line of lines) {
    if (/^\s*>\s*\*Real life example:/i.test(line)) {
      skipBlockquote = true;
      continue;
    }
    if (skipBlockquote) {
      if (line.trim() === '' || line.startsWith('* **') || line.startsWith('###')) {
        skipBlockquote = false;
      } else {
        continue;
      }
    }
    out.push(line);
  }

  return out.join('\n');
}

function inlineRealLifeExamples(markdown) {
  if (!markdown?.trim()) return markdown;

  const section2Split = markdown.split(SECTION2_RE);
  if (section2Split.length < 2) {
    return insertSection3CalloutsOnly(markdown);
  }

  const beforeSection2 = stripCalloutsFromSection1(section2Split[0]);
  const afterSection2Header = section2Split.slice(1).join('');

  const section3Idx = afterSection2Header.search(SECTION3_RE);
  if (section3Idx === -1) return markdown;

  const section2Body = afterSection2Header.slice(0, section3Idx);
  const fromSection3 = afterSection2Header.slice(section3Idx);

  const leadInMatch = section2Body.match(/^([\s\S]*?)(?=^\* \*\*|\s*$)/m);
  let leadIn = '';
  const beforeBullets = (leadInMatch?.[1] || '').trim();
  if (beforeBullets && !beforeBullets.startsWith('*') && !beforeBullets.startsWith('###')) {
    leadIn = beforeBullets.replace(/\n+/g, ' ').trim();
  }

  const section2BulletsOnly = section2Body.replace(/^[\s\S]*?(?=^\* \*\*)/m, '').trim();
  const section2WithCallouts = insertCalloutsAfterBullets(
    `### 2. Real-World Analogy\n${leadIn ? `${leadIn}\n` : ''}${section2BulletsOnly}`,
    { leadIn }
  );

  const section3And4 = insertSection3Callouts(fromSection3);

  return `${beforeSection2.trimEnd()}\n\n${section2WithCallouts.trim()}\n\n${section3And4.trim()}`;
}

function insertSection3Callouts(fromSection3) {
  const section4Idx = fromSection3.search(SECTION4_RE);
  if (section4Idx === -1) {
    return insertCalloutsAfterBullets(fromSection3, { matchBullet: SECTION3_BULLET_RE });
  }

  const section3Part = fromSection3.slice(0, section4Idx);
  const section4Part = fromSection3.slice(section4Idx);

  const section3WithCallouts = insertCalloutsAfterBullets(section3Part, {
    matchBullet: SECTION3_BULLET_RE,
  });

  return `${section3WithCallouts.trimEnd()}\n\n${section4Part.trimStart()}`;
}

function insertSection3CalloutsOnly(markdown) {
  const section3Idx = markdown.search(SECTION3_RE);
  if (section3Idx === -1) return markdown;

  const before = stripCalloutsFromSection1(markdown.slice(0, section3Idx));
  const fromSection3 = markdown.slice(section3Idx);
  return `${before.trimEnd()}\n\n${insertSection3Callouts(fromSection3).trim()}`;
}

function stripAllRealLifeCallouts(markdown) {
  return markdown
    .replace(/^\s*>\s*\*Real life example:[^\n]*\n?/gim, '')
    .replace(/\n{3,}/g, '\n\n');
}

module.exports = {
  inlineRealLifeExamples,
  stripAllRealLifeCallouts,
  normalizeLabel,
  parseLabeledBullets,
};
