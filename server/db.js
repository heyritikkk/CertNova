require('dotenv').config();
const { Pool } = require('pg');

const COURSE_COLUMNS = [
  ['cover_title', 'TEXT'],
  ['cover_subtitle', 'TEXT'],
  ['level', 'TEXT'],
  ['duration', 'TEXT'],
  ['cta_text', 'TEXT'],
  ['image_url', 'TEXT'],
  ['slug', 'TEXT'],
  ['price', 'REAL DEFAULT 0'],
  ['published', 'INTEGER DEFAULT 0'],
  ['content_markdown', 'TEXT'],
  ['quiz_json', 'TEXT'],
  ['content_blocks_json', 'TEXT'],
  ['detail_description', 'TEXT'],
  ['learning_outcomes', 'TEXT'],
  ['instructor_name', 'TEXT'],
  ['rating', 'REAL DEFAULT 4.7'],
  ['student_count', 'TEXT'],
  ['language', 'TEXT'],
  ['created_at', 'TIMESTAMP'],
  ['updated_at', 'TIMESTAMP'],
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/certnova',
});

async function initDB() {
  try {
    const client = await pool.connect();
    console.log('Connected to the PostgreSQL database.');

    await client.query(`CREATE TABLE IF NOT EXISTS content (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      button_text TEXT
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      cover_title TEXT,
      cover_subtitle TEXT,
      level TEXT,
      duration TEXT,
      cta_text TEXT,
      image_url TEXT,
      slug TEXT,
      price REAL DEFAULT 0,
      published INTEGER DEFAULT 0,
      content_markdown TEXT,
      quiz_json TEXT,
      content_blocks_json TEXT,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS highlights (
      id SERIAL PRIMARY KEY,
      title TEXT,
      text TEXT,
      icon_name TEXT
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      course_slug TEXT,
      course_title TEXT,
      user_email TEXT,
      user_name TEXT,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS visitor_analytics (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT UNIQUE,
      email TEXT,
      name TEXT,
      purchased_courses TEXT DEFAULT '[]',
      visit_count INTEGER DEFAULT 1,
      active_lesson TEXT DEFAULT '',
      referrer TEXT DEFAULT 'Direct',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const { rows: visitorRows } = await client.query(`SELECT COUNT(*) as count FROM visitor_analytics`);
    if (parseInt(visitorRows[0].count) === 0) {
      const mockData = [
        ['v_mock_alice', 'alice.vance@linkedin.com', 'Alice Vance', JSON.stringify(['network-security']), 14, 'CompTIA Security+ - 1.3 Symmetric vs Asymmetric Cryptography', 'LinkedIn'],
        ['v_mock_bob', 'bob.miller@gmail.com', 'Bob Miller', JSON.stringify(['network-security']), 8, 'CompTIA Security+ - 2.1 Threat Actors & Vectors', 'Google'],
        ['v_mock_charlie', 'charlie.codes@github.com', 'Charlie Smith', JSON.stringify(['network-security']), 22, 'CompTIA Security+ - 3.2 Port Scanning Practice', 'GitHub'],
        ['v_mock_anonymous1', 'Anonymous', 'Anonymous', '[]', 3, '', 'Twitter'],
        ['v_mock_david', 'david.k@yahoo.com', 'David K.', '[]', 1, '', 'Direct'],
        ['v_mock_emma', 'emma.watson@edu.org', 'Emma Watson', JSON.stringify(['network-security']), 5, 'CompTIA Security+ - 1.1 Intro to Network Security', 'Google']
      ];

      for (const item of mockData) {
        await client.query(`
          INSERT INTO visitor_analytics (visitor_id, email, name, purchased_courses, visit_count, active_lesson, referrer, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP)
        `, item);
      }
    }

    const { rows: contentRows } = await client.query(`SELECT COUNT(*) as count FROM content`);
    if (parseInt(contentRows[0].count) === 0) {
      await client.query(
        `INSERT INTO content (title, description, button_text) VALUES ($1, $2, $3)`,
        [
          'Turning Ideas<br/>into Seamless<br/>Modern',
          'Aliquam fringilla varius est, ut egestas purus dignissim sit amet. Nunc id quam at est scelerisque commodo. Curabitur sed massa sit amet elit vehicula tristique.',
          'Log In',
        ]
      );
    }

    await client.query(`DELETE FROM courses WHERE title IN ('Networking', 'Cryptography', 'Ethical Hacking')`);

    const { rows: highlightRows } = await client.query(`SELECT COUNT(*) as count FROM highlights`);
    if (parseInt(highlightRows[0].count) === 0) {
      await client.query(
        `INSERT INTO highlights (title, text, icon_name) VALUES ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)`,
        [
          'Guided Support',
          'Get step-by-step guidance and clear explanations so you always know what to study next.',
          'Compass',
          'Structured Learning',
          'Follow a clean Security+ roadmap with lessons, labs, and mock tests organized for faster progress.',
          'Route',
          'Exam-Ready Progress',
          'Track your growth with practical tasks and exam-focused practice that prepares you for test day.',
          'ClipboardCheck',
        ]
      );
    }

    await client.query(`UPDATE highlights SET icon_name = 'Compass' WHERE title = 'Guided Support'`);
    await client.query(`UPDATE highlights SET icon_name = 'Route' WHERE title = 'Structured Learning'`);
    await client.query(`UPDATE highlights SET icon_name = 'ClipboardCheck' WHERE title = 'Exam-Ready Progress'`);

    await migrateCourseColumns(client);

    await client.query(`UPDATE courses SET price = 0 WHERE price IS NULL`);
    await client.query(`UPDATE courses SET published = 0 WHERE published IS NULL`);
    await client.query(`UPDATE courses SET slug = lower(replace(trim(title), ' ', '-')) WHERE slug IS NULL OR slug = ''`);

    client.release();
  } catch (err) {
    console.error('Error initializing PostgreSQL database:', err);
  }
}

async function migrateCourseColumns(client) {
  try {
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
    `);

    const existing = new Set(columns.map((col) => col.column_name));
    const missing = COURSE_COLUMNS.filter(([name]) => !existing.has(name));

    for (const [name, type] of missing) {
      await client.query(`ALTER TABLE courses ADD COLUMN ${name} ${type}`);
    }
  } catch (err) {
    console.error('Failed to migrate courses table:', err.message);
  }
}

initDB();

module.exports = pool;
