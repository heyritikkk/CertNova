/** Sidebar / outline titles: 2–3 words (optional leading lesson number). */
export const NAV_TITLE_MIN_WORDS = 2;
export const NAV_TITLE_MAX_WORDS = 3;

export function countNavWords(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return 0;
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  const body = match ? match[2] : trimmed;
  return body.split(/\s+/).filter(Boolean).length;
}

/**
 * Trim to at most maxWords (default 3). Keeps a leading "01" or "1.2" prefix when present.
 */
export function clampNavTitle(text, maxWords = NAV_TITLE_MAX_WORDS) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '';

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (match) {
    const [, num, rest] = match;
    const words = rest.split(/\s+/).filter(Boolean).slice(0, maxWords);
    return words.length ? `${num} ${words.join(' ')}` : num;
  }

  return trimmed.split(/\s+/).filter(Boolean).slice(0, maxWords).join(' ');
}

export function normalizeNavTitle(text) {
  return clampNavTitle(text, NAV_TITLE_MAX_WORDS);
}

export function isNavTitleWordCountValid(text) {
  const n = countNavWords(text);
  return n >= NAV_TITLE_MIN_WORDS && n <= NAV_TITLE_MAX_WORDS;
}

export function normalizeContentBlockNavFields(block) {
  if (!block || block.type !== 'markdown') return block;
  const patch = {};
  if (block.navTitle != null) patch.navTitle = normalizeNavTitle(block.navTitle);
  if (block.sectionTitle?.trim()) patch.sectionTitle = normalizeNavTitle(block.sectionTitle);
  if (block.moduleTitle?.trim()) patch.moduleTitle = normalizeNavTitle(block.moduleTitle);
  return Object.keys(patch).length ? { ...block, ...patch } : block;
}

export function normalizeContentBlocksNavTitles(blocks) {
  return (blocks || []).map(normalizeContentBlockNavFields);
}
