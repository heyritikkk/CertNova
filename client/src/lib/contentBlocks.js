import { normalizeNavTitle, normalizeContentBlocksNavTitles } from './navTitleWords';

export function newBlockId() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMarkdownBlock(content = '') {
  return {
    type: 'markdown',
    id: newBlockId(),
    moduleTitle: '',
    sectionTitle: '',
    navTitle: '',
    content,
  };
}

export function createQuizBlock() {
  return {
    type: 'quiz',
    id: newBlockId(),
    moduleTitle: '',
    sectionTitle: '',
    question: '',
    options: ['', '', ''],
    correctIndex: 0,
  };
}

/** Group lessons into accordion modules (Basics → SQL, Data Types, …) */
export function groupBlocksIntoModules(blocks) {
  const groups = [];
  let currentTitle = null;

  (blocks || []).forEach((block) => {
    const explicit = block.moduleTitle?.trim();
    const title = explicit || currentTitle || 'Course content';

    if (!groups.length || (explicit && explicit !== currentTitle)) {
      groups.push({
        id: `mod-${groups.length}-${title.replace(/\s+/g, '-').toLowerCase()}`,
        title,
        items: [],
      });
      currentTitle = title;
    }

    groups[groups.length - 1].items.push(block);
  });

  return groups;
}

export function findModuleForBlock(modules, blockId) {
  return modules.find((mod) => mod.items.some((item) => item.id === blockId));
}

/** Within one module: flat lessons, or nested sections (parent lesson → sub-lessons). */
export function groupModuleItemsIntoSections(items) {
  const nodes = [];
  let currentSectionTitle = null;
  let currentSection = null;

  (items || []).forEach((block) => {
    const explicit = block.sectionTitle?.trim();
    const title = explicit || currentSectionTitle;

    if (title) {
      if (!currentSection || (explicit && explicit !== currentSectionTitle)) {
        currentSection = {
          type: 'section',
          id: `sec-${nodes.length}-${title.replace(/\s+/g, '-').toLowerCase()}`,
          title,
          items: [],
        };
        nodes.push(currentSection);
        currentSectionTitle = title;
      }
      currentSection.items.push(block);
    } else {
      currentSection = null;
      currentSectionTitle = null;
      nodes.push({ type: 'lesson', block });
    }
  });

  return nodes;
}

export function findSectionForBlock(modules, blockId) {
  for (const mod of modules) {
    for (const node of groupModuleItemsIntoSections(mod.items)) {
      if (node.type === 'section' && node.items.some((b) => b.id === blockId)) {
        return node;
      }
    }
  }
  return null;
}

/** Parent lesson block for a section group (e.g. Network Security). */
export function getSectionParentBlock(node) {
  if (!node || node.type !== 'section') return null;
  const title = node.title?.trim();
  if (!title) return null;
  const exact = node.items.find(
    (b) =>
      b.type === 'markdown' &&
      b.sectionTitle?.trim() === title &&
      b.navTitle?.trim() === title
  );
  return exact || null;
}

/** Sub-lessons only (excludes the parent lesson row from the dropdown list). */
export function getSectionSubLessonBlocks(node) {
  if (!node || node.type !== 'section') return [];
  const parent = getSectionParentBlock(node);
  if (parent) return node.items.filter((b) => b.id !== parent.id);
  return node.items;
}

export function sectionContainsBlock(node, blockId) {
  return node?.type === 'section' && node.items.some((b) => b.id === blockId);
}

/** First `# heading` becomes the page title; remaining markdown is lesson body. */
export function splitMarkdownLeadingTitle(content) {
  const trimmed = (content || '').trim();
  if (!trimmed) return { title: null, body: '' };
  const match = trimmed.match(/^#\s+(.+?)(?:\r?\n|$)/);
  if (!match) return { title: null, body: trimmed };
  return {
    title: match[1].trim(),
    body: trimmed.slice(match[0].length).trim(),
  };
}

export function getBlockNavLabel(block, index) {
  if (block.type === 'markdown') {
    return block.navTitle?.trim() || `Lesson ${index + 1}`;
  }
  if (block.type === 'quiz') {
    const q = block.question?.trim();
    return q ? `Quiz: ${q.slice(0, 36)}${q.length > 36 ? '…' : ''}` : `Quiz ${index + 1}`;
  }
  return `Section ${index + 1}`;
}

/** Breadcrumb segments for admin editor (module › parent › lesson). */
export function getBlockOutlinePath(blocks, blockId) {
  const modules = groupBlocksIntoModules(blocks);
  const mod = findModuleForBlock(modules, blockId);
  const block = (blocks || []).find((b) => b.id === blockId);
  if (!block || !mod) {
    return { parts: ['Course content'], block };
  }

  const idx = blocks.findIndex((b) => b.id === blockId);
  const parts = [mod.title];
  const section = block.sectionTitle?.trim();
  if (section) parts.push(section);
  parts.push(getBlockNavLabel(block, idx));
  return { parts, block, mod };
}

export function moduleTitleForStorage(mod) {
  return mod.title === 'Course content' ? '' : mod.title;
}

export function insertBlockAfter(blocks, afterId, block) {
  if (!afterId) return [...(blocks || []), block];
  const i = (blocks || []).findIndex((b) => b.id === afterId);
  if (i === -1) return [...(blocks || []), block];
  const next = [...blocks];
  next.splice(i + 1, 0, block);
  return next;
}

export function addTopLevelLesson(blocks, mod) {
  const moduleTitle = moduleTitleForStorage(mod);
  const block = createMarkdownBlock();
  block.moduleTitle = moduleTitle;
  block.navTitle = 'New Lesson';
  const last = mod.items[mod.items.length - 1];
  return { blocks: insertBlockAfter(blocks, last?.id, block), block };
}

export function addSubLesson(blocks, { moduleTitle, sectionTitle, afterId }) {
  const block = createMarkdownBlock();
  block.moduleTitle = moduleTitle || '';
  block.sectionTitle = sectionTitle;
  block.navTitle = 'New Sublesson';
  return { blocks: insertBlockAfter(blocks, afterId, block), block };
}

export function ensureFlatLessonHasSection(blocks, blockId) {
  const block = blocks.find((b) => b.id === blockId);
  if (!block || block.sectionTitle?.trim()) return blocks;
  const idx = blocks.findIndex((b) => b.id === blockId);
  const parentName = block.navTitle?.trim() || getBlockNavLabel(block, idx);
  return blocks.map((b) => (b.id === blockId ? { ...b, sectionTitle: parentName } : b));
}

export function addSubLessonUnderFlat(blocks, blockId) {
  let next = ensureFlatLessonHasSection(blocks, blockId);
  const block = next.find((b) => b.id === blockId);
  const mod = findModuleForBlock(groupBlocksIntoModules(next), blockId);
  const moduleTitle = moduleTitleForStorage(mod);
  const sectionTitle = block.sectionTitle?.trim() || block.navTitle?.trim() || 'Lesson';
  return addSubLesson(next, { moduleTitle, sectionTitle, afterId: blockId });
}

export function renameSectionInModule(blocks, mod, oldTitle, newTitle) {
  const oldT = oldTitle?.trim();
  const newT = normalizeNavTitle(newTitle);
  if (!oldT || !newT || oldT === newT) return blocks;
  const itemIds = new Set(mod.items.map((b) => b.id));
  return blocks.map((b) => {
    if (!itemIds.has(b.id)) return b;
    if (b.sectionTitle?.trim() === oldT) return { ...b, sectionTitle: newT };
    return b;
  });
}

export function updateBlockInList(blocks, blockId, patch) {
  return blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b));
}

export function removeBlockFromList(blocks, blockId) {
  if (!blocks || blocks.length <= 1) return blocks;
  return blocks.filter((b) => b.id !== blockId);
}

export function moveBlockInList(blocks, blockId, delta) {
  const i = blocks.findIndex((b) => b.id === blockId);
  if (i < 0) return blocks;
  const j = i + delta;
  if (j < 0 || j >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(i, 1);
  next.splice(j, 0, item);
  return next;
}

export function removeSectionFromModule(blocks, mod, sectionTitle) {
  const title = sectionTitle?.trim();
  if (!title) return blocks;
  const toRemove = new Set(
    mod.items.filter((b) => b.sectionTitle?.trim() === title).map((b) => b.id)
  );
  if (toRemove.size >= blocks.length) return blocks;
  return blocks.filter((b) => !toRemove.has(b.id));
}

export function getVisibleBlocks(blocks) {
  return (blocks || []).filter(
    (b) =>
      (b.type === 'markdown' && b.content?.trim()) ||
      (b.type === 'quiz' && b.question?.trim())
  );
}

export function formatCourseDate(iso) {
  if (!iso) return 'Recently updated';
  const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return 'Recently updated';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function parseContentBlocks(raw) {
  if (!raw) return [createMarkdownBlock()];
  if (Array.isArray(raw)) return raw.length ? raw : [createMarkdownBlock()];
  try {
    const parsed = JSON.parse(raw);
    return normalizeContentBlocksNavTitles(
      Array.isArray(parsed) && parsed.length ? parsed : [createMarkdownBlock()]
    );
  } catch {
    return [createMarkdownBlock()];
  }
}

/** Build blocks from legacy markdown + quiz array */
export function courseToContentBlocks(course) {
  if (course?.content_blocks?.length) {
    return parseContentBlocks(course.content_blocks);
  }

  const blocks = [];
  if (course?.content_markdown?.trim()) {
    blocks.push(createMarkdownBlock(course.content_markdown.trim()));
  }
  (course?.quiz || []).forEach((q) => {
    blocks.push({
      type: 'quiz',
      id: q.id || newBlockId(),
      moduleTitle: '',
      question: q.question || '',
      options: q.options?.length ? [...q.options] : ['', ''],
      correctIndex: q.correctIndex ?? 0,
    });
  });
  return blocks.length ? blocks : [createMarkdownBlock()];
}

/** Syllabus rows for the public course detail page (from admin content blocks). */
export function buildCourseSyllabus(course) {
  const blocks = courseToContentBlocks(course);
  const visible = getVisibleBlocks(blocks);
  const modules = groupBlocksIntoModules(visible);

  return modules.map((mod) => {
    const lessons = [];
    groupModuleItemsIntoSections(mod.items).forEach((node) => {
      if (node.type === 'section') {
        lessons.push({
          id: node.id,
          title: node.title,
          isSection: true,
          durationLabel: `${node.items.length} lesson${node.items.length === 1 ? '' : 's'}`,
        });
        node.items.forEach((block, i) => {
          lessons.push({
            id: block.id,
            title: getBlockNavLabel(block, i),
            isSection: false,
            durationLabel: block.type === 'quiz' ? 'Quiz' : 'Lesson',
          });
        });
      } else {
        const block = node.block;
        lessons.push({
          id: block.id,
          title: getBlockNavLabel(block, lessons.length),
          isSection: false,
          durationLabel: block.type === 'quiz' ? 'Quiz' : 'Lesson',
        });
      }
    });

    return {
      id: mod.id,
      title: mod.title,
      lessons,
      lessonCount: mod.items.length,
    };
  });
}

export function countVisibleLessons(course) {
  return getVisibleBlocks(courseToContentBlocks(course)).length;
}

export function blocksToLegacyFields(blocks) {
  const normalized = normalizeContentBlocksNavTitles(blocks || []);
  const markdownParts = [];
  const quiz = [];

  normalized.forEach((block) => {
    if (block.type === 'markdown' && block.content?.trim()) {
      markdownParts.push(block.content.trim());
    }
    if (block.type === 'quiz' && block.question?.trim()) {
      quiz.push({
        id: block.id,
        question: block.question.trim(),
        options: (block.options || []).map((o) => String(o).trim()).filter(Boolean),
        correctIndex: block.correctIndex ?? 0,
      });
    }
  });

  return {
    content_markdown: markdownParts.join('\n\n'),
    quiz,
    content_blocks: normalized,
  };
}
