const {
  normalizeCoursePayload,
  mapCourseRow,
  slugify,
} = require('./courseHelpers');

function registerCourseRoutes(app, db) {
  const courseColumns =
    'id, title, description, cover_title, cover_subtitle, level, duration, cta_text, image_url, slug, price, published, content_markdown, quiz_json, content_blocks_json, detail_description, learning_outcomes, instructor_name, rating, student_count, language, created_at, updated_at';

  const listCourses = async (onlyPublished) => {
    const sql = onlyPublished
      ? `SELECT ${courseColumns} FROM courses WHERE published = 1 ORDER BY updated_at DESC, id DESC`
      : `SELECT ${courseColumns} FROM courses ORDER BY updated_at DESC, id DESC`;
    const { rows } = await db.query(sql);
    return (rows || []).map(mapCourseRow);
  };

  const getCourseByIdOrSlug = async (idOrSlug, onlyPublished) => {
    const isNumeric = /^\\d+$/.test(String(idOrSlug));
    const sql = isNumeric
      ? `SELECT ${courseColumns} FROM courses WHERE id = $1`
      : `SELECT ${courseColumns} FROM courses WHERE slug = $1`;
    const { rows } = await db.query(sql, [idOrSlug]);
    const row = rows[0];
    if (!row) return null;
    if (onlyPublished && row.published !== 1) return null;
    return mapCourseRow(row);
  };

  app.get('/api/courses', async (req, res) => {
    try {
      const onlyPublished = req.query.all !== '1';
      if (!onlyPublished) {
        if (!app.locals.isAdminRequest(req)) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const rows = await listCourses(false);
        res.json(rows);
        return;
      }
      const rows = await listCourses(onlyPublished);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/courses/:idOrSlug', async (req, res) => {
    try {
      const onlyPublished = req.query.all !== '1';
      if (!onlyPublished) {
        if (!app.locals.isAdminRequest(req)) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        const row = await getCourseByIdOrSlug(req.params.idOrSlug, false);
        if (!row) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }
        res.json(row);
        return;
      }
      const row = await getCourseByIdOrSlug(req.params.idOrSlug, onlyPublished);
      if (!row) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/courses', app.locals.requireAdmin, async (req, res) => {
    const payload = normalizeCoursePayload(req.body);
    if (!payload.title || !payload.description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }

    const insert = async (attemptSlug) => {
      try {
        const { rows } = await db.query(
          `INSERT INTO courses (
            title, description, cover_title, cover_subtitle, level, duration,
            cta_text, image_url, slug, price, published, content_markdown, quiz_json,
            content_blocks_json, detail_description, learning_outcomes, instructor_name,
            rating, student_count, language, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id`,
          [
            payload.title,
            payload.description,
            payload.cover_title,
            payload.cover_subtitle,
            payload.level,
            payload.duration,
            payload.cta_text,
            payload.image_url,
            attemptSlug,
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
          ]
        );
        const row = await getCourseByIdOrSlug(rows[0].id, false);
        res.status(201).json(row);
      } catch (err) {
        if (err.message.includes('unique constraint') || err.code === '23505') {
          await insert(`${attemptSlug}-${Date.now()}`);
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    await insert(payload.slug || slugify(payload.title));
  });

  app.put('/api/courses/:id', app.locals.requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const payload = normalizeCoursePayload(req.body);
      if (!payload.title || !payload.description) {
        res.status(400).json({ error: 'Title and description are required.' });
        return;
      }

      const { rowCount } = await db.query(
        `UPDATE courses SET
          title = $1, description = $2, cover_title = $3, cover_subtitle = $4,
          level = $5, duration = $6, cta_text = $7, image_url = $8, slug = $9,
          price = $10, published = $11, content_markdown = $12, quiz_json = $13,
          content_blocks_json = $14, detail_description = $15, learning_outcomes = $16,
          instructor_name = $17, rating = $18, student_count = $19, language = $20,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $21`,
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
        ]
      );

      if (rowCount === 0) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      const row = await getCourseByIdOrSlug(id, false);
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/courses/:id/publish', app.locals.requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const published = req.body.published === true || req.body.published === 1 ? 1 : 0;

      const { rowCount } = await db.query(
        `UPDATE courses SET published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [published, id]
      );

      if (rowCount === 0) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      const row = await getCourseByIdOrSlug(id, false);
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/courses/:id', app.locals.requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { rowCount } = await db.query('DELETE FROM courses WHERE id = $1', [id]);
      res.json({ message: 'Course deleted successfully', changes: rowCount });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

module.exports = { registerCourseRoutes };
