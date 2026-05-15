const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables if they don't exist
        db.serialize(() => {
            const ensureColumn = (table, column, type) => {
                db.all(`PRAGMA table_info(${table})`, (pragmaErr, columns) => {
                    if (pragmaErr) {
                        console.error(`Failed to inspect ${table}:`, pragmaErr.message);
                        return;
                    }
                    const hasColumn = columns.some((col) => col.name === column);
                    if (!hasColumn) {
                        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (alterErr) => {
                            if (alterErr) {
                                console.error(`Failed to add ${column} to ${table}:`, alterErr.message);
                            }
                        });
                    }
                });
            };

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
                image_url TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS highlights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                text TEXT,
                icon_name TEXT
            )`);
            
            // Insert default values if table is empty
            db.get(`SELECT COUNT(*) as count FROM content`, (err, row) => {
                if (!err && row.count === 0) {
                    db.run(`INSERT INTO content (title, description, button_text) 
                            VALUES (?, ?, ?)`, 
                            [
                                'Turning Ideas<br/>into Seamless<br/>Modern', 
                                'Aliquam fringilla varius est, ut egestas purus dignissim sit amet. Nunc id quam at est scelerisque commodo. Curabitur sed massa sit amet elit vehicula tristique.',
                                'Log In'
                            ]);
                }
            });

            db.run(
                `DELETE FROM courses 
                 WHERE title IN ('Networking', 'Cryptography', 'Ethical Hacking')`
            );

            db.get(`SELECT COUNT(*) as count FROM highlights`, (err, row) => {
                if (!err && row.count === 0) {
                    db.run(`INSERT INTO highlights (title, text, icon_name) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
                        [
                            'Guided Support',
                            'Get step-by-step guidance and clear explanations so you always know what to study next.',
                            'Headphones',
                            'Structured Learning',
                            'Follow a clean Security+ roadmap with lessons, labs, and mock tests organized for faster progress.',
                            'Workflow',
                            'Exam-Ready Progress',
                            'Track your growth with practical tasks and exam-focused practice that prepares you for test day.',
                            'Gauge'
                        ]);
                }
            });

            ensureColumn('courses', 'cover_title', 'TEXT');
            ensureColumn('courses', 'cover_subtitle', 'TEXT');
            ensureColumn('courses', 'level', 'TEXT');
            ensureColumn('courses', 'duration', 'TEXT');
            ensureColumn('courses', 'cta_text', 'TEXT');
            ensureColumn('courses', 'image_url', 'TEXT');
        });
    }
});

module.exports = db;
