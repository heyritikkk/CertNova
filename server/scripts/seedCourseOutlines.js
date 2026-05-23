const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
});

function generateOutlineForCourse(courseTitle) {
  // Using generic module names that adapt to the course
  const modules = [
    { nav: `01 ${courseTitle.split(' ')[0]} Foundations`, title: `01 Foundations of ${courseTitle}` },
    { nav: '02 Core Concepts', title: `02 Core Concepts` },
    { nav: '03 Best Practices', title: `03 Best Practices & Defense` },
    { nav: '04 Advanced Scenarios', title: `04 Advanced Scenarios` },
    { nav: '05 Final Assessment', title: `05 Review & Assessment` }
  ];

  const blocks = [];
  modules.forEach((mod, modIdx) => {
    const sectionTitle = mod.nav;
    
    // Module overview
    blocks.push({
      type: 'markdown',
      id: `gen-${modIdx}-overview`,
      moduleTitle: mod.nav,
      sectionTitle,
      navTitle: mod.nav,
      content: `# ${mod.title}\n\nOverview of this module.\n\n---\n\nOpen the sub-lessons below to study each topic.`,
    });

    // 4 Sub-lessons
    for (let i = 1; i <= 4; i++) {
      const lesNum = `${modIdx + 1}.${i}`;
      blocks.push({
        type: 'markdown',
        id: `gen-${modIdx}-${i}`,
        moduleTitle: mod.nav,
        sectionTitle,
        navTitle: `${lesNum} Lesson ${i}`,
        content: `# ${lesNum} Lesson ${i} - ${courseTitle}\n\nContent for this lesson will go here. You can add text, markdown, and PlantUML diagrams.\n\n---\n\nExpand this lesson in the admin **Course content** editor.`,
      });
    }
  });

  return blocks;
}

db.serialize(() => {
  db.all(`SELECT id, title, content_blocks_json FROM courses`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }

    db.run('BEGIN TRANSACTION');
    
    const stmt = db.prepare(`UPDATE courses SET content_blocks_json = ? WHERE id = ?`);
    let count = 0;

    rows.forEach(row => {
      // If it has no content blocks or just an empty array, generate an outline
      if (!row.content_blocks_json || row.content_blocks_json === '[]' || row.content_blocks_json === '""') {
        const outline = generateOutlineForCourse(row.title);
        stmt.run(JSON.stringify(outline), row.id);
        count++;
        console.log(`Generated outline for: ${row.title}`);
      }
    });

    stmt.finalize();
    
    db.run('COMMIT', (commitErr) => {
      if (commitErr) {
        console.error('Commit error:', commitErr.message);
      } else {
        console.log(`Successfully generated syllabus outlines for ${count} courses.`);
      }
      db.close();
    });
  });
});
