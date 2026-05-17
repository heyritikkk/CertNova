const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

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
  ['created_at', 'TEXT'],
  ['updated_at', 'TEXT'],
];

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the SQLite database:', err.message);
    return;
  }

  console.log('Connected to the SQLite database.');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      button_text TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT,
      updated_at TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      text TEXT,
      icon_name TEXT
    )`);

    db.get(`SELECT COUNT(*) as count FROM content`, (contentErr, contentRow) => {
      if (!contentErr && contentRow.count === 0) {
        db.run(
          `INSERT INTO content (title, description, button_text) VALUES (?, ?, ?)`,
          [
            'Turning Ideas<br/>into Seamless<br/>Modern',
            'Aliquam fringilla varius est, ut egestas purus dignissim sit amet. Nunc id quam at est scelerisque commodo. Curabitur sed massa sit amet elit vehicula tristique.',
            'Log In',
          ]
        );
      }
    });

    db.run(
      `DELETE FROM courses WHERE title IN ('Networking', 'Cryptography', 'Ethical Hacking')`
    );

    db.get(`SELECT COUNT(*) as count FROM highlights`, (highlightErr, highlightRow) => {
      if (!highlightErr && highlightRow.count === 0) {
        db.run(
          `INSERT INTO highlights (title, text, icon_name) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
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
    });

    db.run(`UPDATE highlights SET icon_name = 'Compass' WHERE title = 'Guided Support'`);
    db.run(`UPDATE highlights SET icon_name = 'Route' WHERE title = 'Structured Learning'`);
    db.run(
      `UPDATE highlights SET icon_name = 'ClipboardCheck' WHERE title = 'Exam-Ready Progress'`
    );

    migrateCourseColumns(() => {
      db.run(`UPDATE courses SET price = 0 WHERE price IS NULL`);
      db.run(
        `UPDATE courses SET published = 0 WHERE published IS NULL`
      );
      db.run(
        `UPDATE courses SET slug = lower(replace(trim(title), ' ', '-')) WHERE slug IS NULL OR slug = ''`
      );
    });
  });
});

function migrateCourseColumns(done) {
  db.all('PRAGMA table_info(courses)', (pragmaErr, columns) => {
    if (pragmaErr) {
      console.error('Failed to inspect courses table:', pragmaErr.message);
      done();
      return;
    }

    const existing = new Set(columns.map((col) => col.name));
    const missing = COURSE_COLUMNS.filter(([name]) => !existing.has(name));

    const addNext = (index) => {
      if (index >= missing.length) {
        done();
        return;
      }

      const [name, type] = missing[index];
      db.run(`ALTER TABLE courses ADD COLUMN ${name} ${type}`, (alterErr) => {
        if (alterErr) {
          console.error(`Failed to add ${name} to courses:`, alterErr.message);
        }
        addNext(index + 1);
      });
    };

    addNext(0);
  });
}

module.exports = db;
