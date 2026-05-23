const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
});

const PAID_COURSES = [
  'Threat Management',
  'Risk & Compliance',
  'Security Architecture',
  'Incident Response',
  'Governance & Policies'
];

db.serialize(() => {
  const placeholders = PAID_COURSES.map(() => '?').join(',');
  const query = `UPDATE courses SET price = 49.99 WHERE title IN (${placeholders})`;

  db.run(query, PAID_COURSES, function(err) {
    if (err) {
      console.error('Error updating courses:', err.message);
    } else {
      console.log(`Successfully updated ${this.changes} courses to be paid ($49.99).`);
    }
    db.close();
  });
});
