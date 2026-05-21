/** Sidebar / outline titles: 2–3 words (optional leading lesson number). */
const NAV_TITLE_MAX_WORDS = 3;

function clampNavTitle(text, maxWords = NAV_TITLE_MAX_WORDS) {
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

function normalizeContentBlockNavFields(block) {
  if (!block || block.type !== 'markdown') return block;
  const patch = {};
  if (block.navTitle != null) patch.navTitle = clampNavTitle(block.navTitle);
  if (block.sectionTitle?.trim()) patch.sectionTitle = clampNavTitle(block.sectionTitle);
  if (block.moduleTitle?.trim()) patch.moduleTitle = clampNavTitle(block.moduleTitle);
  return Object.keys(patch).length ? { ...block, ...patch } : block;
}

function normalizeContentBlocksNavTitles(blocks) {
  return (blocks || []).map(normalizeContentBlockNavFields);
}

module.exports = {
  NAV_TITLE_MAX_WORDS,
  clampNavTitle,
  normalizeContentBlocksNavTitles,
};
