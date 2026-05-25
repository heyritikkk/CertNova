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
  { title: 'Application Security Engineering', level: 'Intermediate', price: 899 },
  { title: 'Web Application Security', level: 'Beginner', price: 899 },
  { title: 'Ethical Hacking and Pentesting', level: 'Intermediate', price: 899 },
  { title: 'Cloud Security Engineering', level: 'Intermediate', price: 899 },
  { title: 'Red Team Operations', level: 'Advanced', price: 1299 },
  { title: 'SOC Analyst Level 1 and 2', level: 'Beginner', price: 899 },
  { title: 'Malware Analysis and Reverse Engineering', level: 'Advanced', price: 1299 },
  { title: 'Cybersecurity Fundamentals', level: 'Beginner', price: 0 },
  { title: 'Cyber Threat Intelligence', level: 'Intermediate', price: 699 },
  { title: 'Digital Forensics and Incident Response', level: 'Intermediate', price: 899 }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

db.serialize(() => {
  db.run('DELETE FROM courses');

  const stmt = db.prepare(`
    INSERT INTO courses (
      title, description, cover_title, cover_subtitle, level, duration, cta_text,
      image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json,
      detail_description, learning_outcomes, instructor_name, rating, student_count, language,
      created_at, updated_at
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '', '[]', '[]', ?, ?, ?, 4.7, ?, ?, datetime('now'), datetime('now'))
  `);

  let count = 0;

  db.run('BEGIN TRANSACTION');

  for (const course of COURSES) {
    const slug = slugify(course.title);
    const desc = `Master ${course.title} to advance your cybersecurity career.`;
    
    stmt.run([
      course.title,
      desc,
      course.title,
      'Certification Path',
      course.level,
      '20 hours',
      course.price === 0 ? 'Start Free' : 'View Course',
      '',
      slug,
      course.price,
      desc,
      '',
      'CertNova Team',
      '0',
      'English'
    ], function(err) {
      if (err) {
        console.error(`Error inserting ${course.title}:`, err.message);
      } else {
        count++;
      }
    });
  }

  stmt.finalize();
  
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Commit error:', err.message);
    } else {
      console.log(`Replaced catalog with ${count} new courses.`);
    }
    db.close();
  });
});
