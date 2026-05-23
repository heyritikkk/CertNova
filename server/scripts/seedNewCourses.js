const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
});

const COURSES = [
  'Network Security',
  'Cryptography',
  'Threat Management',
  'Identity & Access',
  'Risk & Compliance',
  'Incident Response',
  'Secure Protocols',
  'Vulnerability Assessment',
  'Security Architecture',
  'Governance & Policies'
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO courses (
      title, description, cover_title, cover_subtitle, level, duration, cta_text,
      image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json,
      detail_description, learning_outcomes, instructor_name, rating, student_count, language,
      created_at, updated_at
    ) 
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, '', '[]', '[]', ?, ?, ?, 4.7, ?, ?, datetime('now'), datetime('now')
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = ?)
  `);

  let count = 0;

  db.run('BEGIN TRANSACTION');

  for (const title of COURSES) {
    const slug = slugify(title);
    const desc = `Learn the fundamentals of ${title} and prepare for your certification.`;
    
    stmt.run([
      title,          // title
      desc,           // description
      title,          // cover_title
      'Master the basics', // cover_subtitle
      'Beginner',     // level
      '2 hours',      // duration
      'View Course',  // cta_text
      '',             // image_url
      slug,           // slug
      desc,           // detail_description
      '',             // learning_outcomes
      'CertNova Team',// instructor_name
      '0',            // student_count
      'English',      // language
      title           // WHERE NOT EXISTS title
    ], function(err) {
      if (err) {
        console.error(`Error inserting ${title}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`Created course: ${title}`);
        count++;
      } else {
        console.log(`Course already exists: ${title}`);
      }
    });
  }

  stmt.finalize();
  
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Commit error:', err.message);
    } else {
      console.log(`Finished seeding. Added ${count} new courses.`);
    }
    db.close();
  });
});
