/**
 * Seed script to add the Knowledge Check course to the database.
 * Run: node server/scripts/seedKnowledgeCheck.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');
const { slugify } = require('../courseHelpers');

async function seedKnowledgeCheck() {
  const title = "Security+ Knowledge Check Exam";
  const slug = "knowledge-check"; // This exact slug is used in CourseLessonLayout to render the portal
  const price = 19;
  
  const description = "Test your readiness for the CompTIA Security+ exam with a randomized 20-question practice test pulled from a 50-question bank. This assessment includes detailed performance diagnostics.";
  
  // Create a placeholder content block so the course doesn't appear totally empty if queried.
  // The actual quiz portal bypasses these blocks completely.
  const contentBlocksJson = JSON.stringify([
    {
      id: "kc-intro-block",
      type: "markdown",
      content: "## Welcome to the Knowledge Check\n\nThe knowledge check portal will override this content when you start the exam."
    }
  ]);

  try {
    console.log(`Checking if '${title}' exists...`);
    const existing = await db.query('SELECT id FROM courses WHERE slug = $1', [slug]);

    if (existing.rows && existing.rows.length > 0) {
      console.log(`Course '${title}' already exists. Updating price...`);
      await db.query(
        `UPDATE courses 
         SET price = $1, description = $2, published = 1, updated_at = CURRENT_TIMESTAMP
         WHERE slug = $3`,
        [price, description, slug]
      );
    } else {
      console.log(`Creating new course: '${title}'...`);
      await db.query(
        `INSERT INTO courses (
          title, description, cover_title, cover_subtitle, level, duration,
          cta_text, image_url, slug, price, published, content_markdown, quiz_json,
          content_blocks_json, detail_description, learning_outcomes, instructor_name,
          rating, student_count, language, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
        [
          title,
          description,
          title,
          'Randomized 20-Question Practice Exam',
          'Beginner',
          '30 minutes',
          'Start Practice Exam',
          '/images/course-3.jpg', // Placeholder image
          slug,
          price,
          1, // Published
          '', // content_markdown
          '{}', // quiz_json
          contentBlocksJson,
          "Take this comprehensive randomized quiz to validate your knowledge before sitting for the real exam.",
          JSON.stringify(["Identify weak areas across all Security+ domains.", "Experience a timed testing environment.", "Get detailed feedback on incorrect answers."]),
          'CertNova Team',
          '4.9',
          1250,
          'English'
        ]
      );
    }

    console.log('✅ Knowledge Check course seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed Knowledge Check:', error.message);
  } finally {
    process.exit(0);
  }
}

seedKnowledgeCheck();
