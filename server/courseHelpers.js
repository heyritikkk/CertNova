function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'course';
}

function parseQuiz(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseContentBlocks(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const { normalizeContentBlocksNavTitles } = require('./lib/navTitleWords');

function normalizeCoursePayload(body = {}) {
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const coverTitle = String(body.cover_title || title).trim();
  const coverSubtitle = String(body.cover_subtitle || description).trim();
  const level = String(body.level || 'Beginner').trim();
  const duration = String(body.duration || '10h').trim();
  const ctaText = String(body.cta_text || 'View Course').trim();
  const imageUrl = String(body.image_url || '').trim();
  const contentMarkdown = String(body.content_markdown || '').trim();
  const slug = String(body.slug || slugify(title)).trim() || slugify(title);
  const price = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;
  const published = body.published === true || body.published === 1 || body.published === '1' ? 1 : 0;
  const quiz = parseQuiz(body.quiz);
  const contentBlocks = normalizeContentBlocksNavTitles(parseContentBlocks(body.content_blocks));
  const detailDescription = String(body.detail_description || description).trim();
  const learningOutcomes = String(body.learning_outcomes || '').trim();
  const instructorName = String(body.instructor_name || '').trim();
  const rating = Number.isFinite(Number(body.rating)) ? Math.min(5, Math.max(0, Number(body.rating))) : 4.7;
  const studentCount = String(body.student_count || '').trim();
  const language = String(body.language || 'English').trim() || 'English';

  return {
    title,
    description,
    cover_title: coverTitle,
    cover_subtitle: coverSubtitle,
    level,
    duration,
    cta_text: ctaText,
    image_url: imageUrl,
    content_markdown: contentMarkdown,
    slug,
    price: Math.max(0, price),
    published,
    quiz_json: JSON.stringify(quiz),
    quiz,
    content_blocks_json: JSON.stringify(contentBlocks),
    content_blocks: contentBlocks,
    detail_description: detailDescription,
    learning_outcomes: learningOutcomes,
    instructor_name: instructorName,
    rating,
    student_count: studentCount,
    language,
  };
}

function parseLearningOutcomes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return String(raw)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapCourseRow(row) {
  if (!row) return null;
  return {
    ...row,
    published: row.published === 1,
    price: Number(row.price) || 0,
    rating: Number(row.rating) || 4.7,
    quiz: parseQuiz(row.quiz_json),
    content_blocks: parseContentBlocks(row.content_blocks_json),
    learning_outcomes_list: parseLearningOutcomes(row.learning_outcomes),
  };
}

function isCardComplete(course) {
  return Boolean(
    course?.title?.trim() &&
    course?.description?.trim() &&
    course?.level?.trim() &&
    course?.duration?.trim()
  );
}

module.exports = {
  slugify,
  parseQuiz,
  parseContentBlocks,
  parseLearningOutcomes,
  normalizeCoursePayload,
  mapCourseRow,
  isCardComplete,
};
