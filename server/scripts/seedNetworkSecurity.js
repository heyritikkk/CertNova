/**
 * Seed or update the Network Security course content_blocks in SQLite.
 * Run: node server/scripts/seedNetworkSecurity.js
 */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { buildNetworkSecurityBlocks, COURSE_META } = require('../seeds/networkSecurityContent');
const { loadAllLessonContent } = require('../seeds/parseNetworkSecurityManual');

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const lessonContent = loadAllLessonContent();
const blocks = buildNetworkSecurityBlocks(lessonContent);
const blocksJson = JSON.stringify(blocks);
const outcomes = COURSE_META.learning_outcomes;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
});

db.get(
  `SELECT id, title FROM courses WHERE slug = ?`,
  [COURSE_META.slug],
  (err, row) => {
    if (err) {
      console.error(err.message);
      db.close();
      process.exit(1);
    }

    if (row) {
      db.run(
        `UPDATE courses SET
          content_blocks_json = ?,
          title = COALESCE(NULLIF(trim(title), ''), ?),
          description = CASE WHEN trim(COALESCE(description, '')) = '' THEN ? ELSE description END,
          detail_description = CASE WHEN trim(COALESCE(detail_description, '')) = '' THEN ? ELSE detail_description END,
          learning_outcomes = CASE WHEN trim(COALESCE(learning_outcomes, '')) = '' THEN ? ELSE learning_outcomes END,
          duration = COALESCE(NULLIF(trim(duration), ''), ?),
          updated_at = datetime('now')
        WHERE slug = ?`,
        [
          blocksJson,
          COURSE_META.title,
          COURSE_META.description,
          COURSE_META.detail_description,
          outcomes,
          COURSE_META.duration,
          COURSE_META.slug,
        ],
        function onUpdate(updateErr) {
          if (updateErr) {
            console.error(updateErr.message);
            process.exit(1);
          }
          console.log(
            `Updated course "${row.title}" (id ${row.id}): ${blocks.length} content blocks (5 modules × 4 sub-lessons + overviews).`
          );
          db.close();
        }
      );
      return;
    }

    db.run(
      `INSERT INTO courses (
        title, description, cover_title, cover_subtitle, level, duration, cta_text,
        image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json,
        detail_description, learning_outcomes, instructor_name, rating, student_count, language,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '', '[]', ?, ?, ?, ?, 4.7, ?, ?, datetime('now'), datetime('now'))`,
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
      ],
      function onInsert(insertErr) {
        if (insertErr) {
          console.error(insertErr.message);
          process.exit(1);
        }
        console.log(
          `Created course "${COURSE_META.title}" (id ${this.lastID}): ${blocks.length} content blocks.`
        );
        db.close();
      }
    );
  }
);
