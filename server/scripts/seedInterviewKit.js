require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');

const INTERVIEW_COURSE = {
  slug: 'security-interview-kit',
  title: 'Security+ Interview Prep Kit',
  category: 'Interview Kit',
  level: 'Advanced',
  price: 49,
  description: 'A comprehensive prep kit for cracking entry-level and mid-level cybersecurity interviews, filled with mock scenarios, behavioral questions, and deep technical drills.',
  thumbnail_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
  is_published: 1,
  content_blocks_json: JSON.stringify([
    {
      id: "int-1",
      type: "markdown",
      content: "# Cybersecurity Interviews\\n\\nWelcome to the Interview Prep Kit. We will cover technical Q&A, HR rounds, and scenario-based tests."
    }
  ])
};

async function seedInterviewKit() {
  try {
    console.log('Seeding Interview Kit...');
    
    const existing = await db.query('SELECT id FROM courses WHERE slug = $1', [INTERVIEW_COURSE.slug]);
    
    if (existing.rows && existing.rows.length > 0) {
      console.log('Interview Kit course already exists, skipping insert.');
    } else {
      await db.query(`
        INSERT INTO courses (
          title, description, cover_title, cover_subtitle, level, duration,
          cta_text, image_url, slug, price, published, content_markdown, quiz_json,
          content_blocks_json, detail_description, learning_outcomes, instructor_name,
          rating, student_count, language, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [
        INTERVIEW_COURSE.title,
        INTERVIEW_COURSE.description,
        INTERVIEW_COURSE.title,
        'Crack the Interview',
        INTERVIEW_COURSE.level,
        '1 Week',
        'Start Preparing',
        INTERVIEW_COURSE.thumbnail_url,
        INTERVIEW_COURSE.slug,
        INTERVIEW_COURSE.price,
        INTERVIEW_COURSE.is_published,
        '',
        '{}',
        INTERVIEW_COURSE.content_blocks_json,
        'Prep for technical security interviews',
        JSON.stringify(['Pass interviews', 'Technical answers', 'Salary negotiation']),
        'CertNova Team',
        '4.9',
        500,
        'English'
      ]);
      console.log('Successfully seeded Interview Kit course.');
    }
  } catch (error) {
    console.error('Failed to seed Interview Kit:', error);
  } finally {
    process.exit(0);
  }
}

seedInterviewKit();
