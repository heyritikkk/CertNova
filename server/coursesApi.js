const {
  normalizeCoursePayload,
  mapCourseRow,
  slugify,
} = require('./courseHelpers');

function registerCourseRoutes(app, db) {
  const courseColumns =
    'id, title, description, cover_title, cover_subtitle, level, duration, cta_text, image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json, detail_description, learning_outcomes, instructor_name, rating, student_count, language, created_at, updated_at';

  const listCourses = (onlyPublished) =>
    new Promise((resolve, reject) => {
      const sql = onlyPublished
        ? `SELECT ${courseColumns} FROM courses WHERE published = 1 ORDER BY updated_at DESC, id DESC`
        : `SELECT ${courseColumns} FROM courses ORDER BY updated_at DESC, id DESC`;
      db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve((rows || []).map(mapCourseRow));
      });
    });

  const getCourseByIdOrSlug = (idOrSlug, onlyPublished) =>
    new Promise((resolve, reject) => {
      const isNumeric = /^\d+$/.test(String(idOrSlug));
      const sql = isNumeric
        ? `SELECT ${courseColumns} FROM courses WHERE id = ?`
        : `SELECT ${courseColumns} FROM courses WHERE slug = ?`;
      db.get(sql, [idOrSlug], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else if (onlyPublished && row.published !== 1) resolve(null);
        else resolve(mapCourseRow(row));
      });
    });

  app.get('/api/courses', (req, res) => {
    const onlyPublished = req.query.all !== '1';
    listCourses(onlyPublished)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(500).json({ error: err.message }));
  });

  app.get('/api/courses/:idOrSlug', (req, res) => {
    const onlyPublished = req.query.all !== '1';
    getCourseByIdOrSlug(req.params.idOrSlug, onlyPublished)
      .then((row) => {
        if (!row) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }
        res.json(row);
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  });

  app.post('/api/courses', (req, res) => {
    const payload = normalizeCoursePayload(req.body);
    if (!payload.title || !payload.description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }

    const insert = () => {
      db.run(
        `INSERT INTO courses (
          title, description, cover_title, cover_subtitle, level, duration,
          cta_text, image_url, slug, price, published, content_markdown, quiz_json,
          content_blocks_json, detail_description, learning_outcomes, instructor_name,
          rating, student_count, language, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          payload.title,
          payload.description,
          payload.cover_title,
          payload.cover_subtitle,
          payload.level,
          payload.duration,
          payload.cta_text,
          payload.image_url,
          payload.slug,
          payload.price,
          payload.published,
          payload.content_markdown,
          payload.quiz_json,
          payload.content_blocks_json,
          payload.detail_description,
          payload.learning_outcomes,
          payload.instructor_name,
          payload.rating,
          payload.student_count,
          payload.language,
        ],
        function onInsert(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed: courses.slug')) {
              payload.slug = `${payload.slug}-${Date.now()}`;
              insert();
              return;
            }
            res.status(500).json({ error: err.message });
            return;
          }
          getCourseByIdOrSlug(String(this.lastID), false).then((row) => res.status(201).json(row));
        }
      );
    };

    insert();
  });

  app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const payload = normalizeCoursePayload(req.body);
    if (!payload.title || !payload.description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }

    db.run(
      `UPDATE courses SET
        title = ?, description = ?, cover_title = ?, cover_subtitle = ?,
        level = ?, duration = ?, cta_text = ?, image_url = ?, slug = ?,
        price = ?, published = ?, content_markdown = ?, quiz_json = ?,
        content_blocks_json = ?, detail_description = ?, learning_outcomes = ?,
        instructor_name = ?, rating = ?, student_count = ?, language = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        payload.title,
        payload.description,
        payload.cover_title,
        payload.cover_subtitle,
        payload.level,
        payload.duration,
        payload.cta_text,
        payload.image_url,
        payload.slug || slugify(payload.title),
        payload.price,
        payload.published,
        payload.content_markdown,
        payload.quiz_json,
        payload.content_blocks_json,
        payload.detail_description,
        payload.learning_outcomes,
        payload.instructor_name,
        payload.rating,
        payload.student_count,
        payload.language,
        id,
      ],
      function onUpdate(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }
        getCourseByIdOrSlug(id, false).then((row) => res.json(row));
      }
    );
  });

  app.patch('/api/courses/:id/publish', (req, res) => {
    const { id } = req.params;
    const published = req.body.published === true || req.body.published === 1 ? 1 : 0;

    db.run(
      `UPDATE courses SET published = ?, updated_at = datetime('now') WHERE id = ?`,
      [published, id],
      function onPublish(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }
        getCourseByIdOrSlug(id, false).then((row) => res.json(row));
      }
    );
  });

  app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM courses WHERE id = ?', [id], function onDelete(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Course deleted successfully', changes: this.changes });
    });
  });
}

module.exports = { registerCourseRoutes };
