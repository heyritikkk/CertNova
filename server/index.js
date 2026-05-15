const express = require('express');
const cors = require('cors');
const db = require('./db');
const { registerCourseRoutes } = require('./coursesApi');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/content', (req, res) => {
  db.get('SELECT * FROM content LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.put('/api/content/:id', (req, res) => {
  const { title, description, button_text } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE content SET title = ?, description = ?, button_text = ? WHERE id = ?',
    [title, description, button_text, id],
    function onUpdate(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Content updated successfully', changes: this.changes });
    }
  );
});

registerCourseRoutes(app, db);

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
  db.run(
    'UPDATE highlights SET title = ?, text = ?, icon_name = ? WHERE id = ?',
    [title, text, icon_name, id],
    function onUpdate(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Highlight updated successfully', changes: this.changes });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
