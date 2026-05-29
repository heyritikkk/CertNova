/**
 * Seed or update the Network Security course content_blocks in Postgres.
 * Run: node server/scripts/seedNetworkSecurity.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../db');
const { buildNetworkSecurityBlocks, COURSE_META } = require('../seeds/networkSecurityContent');
const { loadAllLessonContent } = require('../seeds/parseNetworkSecurityManual');

const lessonContent = loadAllLessonContent();
const blocks = buildNetworkSecurityBlocks(lessonContent);
const blocksJson = JSON.stringify(blocks);
const outcomes = COURSE_META.learning_outcomes;

(async () => {
  try {
    const { rows } = await pool.query(`SELECT id, title FROM courses WHERE slug = $1`, [COURSE_META.slug]);
    const row = rows[0];

    if (row) {
      await pool.query(
        `UPDATE courses SET
          content_blocks_json = $1,
          title = COALESCE(NULLIF(trim(title), ''), $2),
          description = CASE WHEN trim(COALESCE(description, '')) = '' THEN $3 ELSE description END,
          detail_description = CASE WHEN trim(COALESCE(detail_description, '')) = '' THEN $4 ELSE detail_description END,
          learning_outcomes = CASE WHEN trim(COALESCE(learning_outcomes, '')) = '' THEN $5 ELSE learning_outcomes END,
          duration = COALESCE(NULLIF(trim(duration), ''), $6),
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = $7`,
        [
          blocksJson,
          COURSE_META.title,
          COURSE_META.description,
          COURSE_META.detail_description,
          outcomes,
          COURSE_META.duration,
          COURSE_META.slug,
        ]
      );
      console.log(`Updated course "${row.title}" (id ${row.id}): ${blocks.length} content blocks (5 modules × 4 sub-lessons + overviews).`);
      return;
    }

    const insertRes = await pool.query(
      `INSERT INTO courses (
        title, description, cover_title, cover_subtitle, level, duration, cta_text,
        image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json,
        detail_description, learning_outcomes, instructor_name, rating, student_count, language,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, '', '[]', $10, $11, $12, $13, 4.7, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        COURSE_META.title,
        COURSE_META.description,
        COURSE_META.cover_title,
        COURSE_META.cover_subtitle,
        COURSE_META.level,
        COURSE_META.duration,
        'View Course',
        '',
        COURSE_META.slug,
        blocksJson,
        COURSE_META.detail_description,
        outcomes,
        COURSE_META.instructor_name,
        COURSE_META.student_count,
        COURSE_META.language,
      ]
    );
    console.log(`Created course "${COURSE_META.title}" (id ${insertRes.rows[0].id}): ${blocks.length} content blocks.`);
  } catch (err) {
    console.error('Failed to seed database:', err.message);
  } finally {
    pool.end();
    process.exit(0);
  }
})();
