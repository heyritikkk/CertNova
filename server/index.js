const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API route to get content
app.get('/api/content', (req, res) => {
    db.get('SELECT * FROM content LIMIT 1', (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// API route to update content (for Admin Portal)
app.put('/api/content/:id', (req, res) => {
    const { title, description, button_text } = req.body;
    const { id } = req.params;
    
    db.run(
        'UPDATE content SET title = ?, description = ?, button_text = ? WHERE id = ?',
        [title, description, button_text, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Content updated successfully', changes: this.changes });
        }
    );
});

// Courses API routes
app.get('/api/courses', (req, res) => {
    db.all('SELECT * FROM courses ORDER BY id ASC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/courses', (req, res) => {
    const {
        title,
        description,
        cover_title,
        cover_subtitle,
        level,
        duration,
        cta_text,
        image_url
    } = req.body;
    const safeTitle = (title || '').trim();
    const safeDescription = (description || '').trim();
    const safeCoverTitle = (cover_title || safeTitle).trim();
    const safeCoverSubtitle = (cover_subtitle || safeDescription).trim();
    const safeLevel = (level || 'Advanced').trim();
    const safeDuration = (duration || '10h').trim();
    const safeCtaText = (cta_text || 'View Course').trim();
    const safeImageUrl = (image_url || '').trim();

    db.run(
        `INSERT INTO courses (title, description, cover_title, cover_subtitle, level, duration, cta_text, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [safeTitle, safeDescription, safeCoverTitle, safeCoverSubtitle, safeLevel, safeDuration, safeCtaText, safeImageUrl],
        function(err) {
            if (err) {
                if (err.message.includes('no column named cover_title')) {
                    db.run(
                        'INSERT INTO courses (title, description) VALUES (?, ?)',
                        [safeTitle, safeDescription],
                        function(legacyErr) {
                            if (legacyErr) {
                                res.status(500).json({ error: legacyErr.message });
                                return;
                            }
                            db.get('SELECT * FROM courses WHERE id = ?', [this.lastID], (getErr, row) => {
                                if (getErr) {
                                    res.status(500).json({ error: getErr.message });
                                    return;
                                }
                                res.json(row);
                            });
                        }
                    );
                    return;
                }

                res.status(500).json({ error: err.message });
                return;
            }

            db.get('SELECT * FROM courses WHERE id = ?', [this.lastID], (getErr, row) => {
                if (getErr) {
                    res.status(500).json({ error: getErr.message });
                    return;
                }
                res.json(row);
            });
        }
    );
});

app.put('/api/courses/:id', (req, res) => {
    const {
        title,
        description,
        cover_title,
        cover_subtitle,
        level,
        duration,
        cta_text,
        image_url
    } = req.body;
    const { id } = req.params;
    const safeTitle = (title || '').trim();
    const safeDescription = (description || '').trim();
    const safeCoverTitle = (cover_title || safeTitle).trim();
    const safeCoverSubtitle = (cover_subtitle || safeDescription).trim();
    const safeLevel = (level || 'Advanced').trim();
    const safeDuration = (duration || '10h').trim();
    const safeCtaText = (cta_text || 'View Course').trim();
    const safeImageUrl = (image_url || '').trim();

    db.run(
        `UPDATE courses 
         SET title = ?, description = ?, cover_title = ?, cover_subtitle = ?, level = ?, duration = ?, cta_text = ?, image_url = ? 
         WHERE id = ?`,
        [safeTitle, safeDescription, safeCoverTitle, safeCoverSubtitle, safeLevel, safeDuration, safeCtaText, safeImageUrl, id],
        function(err) {
            if (err) {
                if (err.message.includes('no such column: cover_title')) {
                    db.run(
                        'UPDATE courses SET title = ?, description = ? WHERE id = ?',
                        [safeTitle, safeDescription, id],
                        function(legacyErr) {
                            if (legacyErr) {
                                res.status(500).json({ error: legacyErr.message });
                                return;
                            }
                            res.json({ message: 'Course updated successfully', changes: this.changes });
                        }
                    );
                    return;
                }

                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Course updated successfully', changes: this.changes });
        }
    );
});

app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Course deleted successfully', changes: this.changes });
    });
});

// Highlight cards API routes
app.get('/api/highlights', (req, res) => {
    db.all('SELECT * FROM highlights ORDER BY id ASC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.put('/api/highlights/:id', (req, res) => {
    const { title, text, icon_name } = req.body;
    const { id } = req.params;
    db.run('UPDATE highlights SET title = ?, text = ?, icon_name = ? WHERE id = ?', [title, text, icon_name, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Highlight updated successfully', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
