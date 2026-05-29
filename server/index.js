const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { registerCourseRoutes } = require('./coursesApi');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM content LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/content/:id', async (req, res) => {
  const { title, description, button_text } = req.body;
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      'UPDATE content SET title = $1, description = $2, button_text = $3 WHERE id = $4',
      [title, description, button_text, id]
    );
    res.json({ message: 'Content updated successfully', changes: rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

registerCourseRoutes(app, pool);

app.get('/api/highlights', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM highlights ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/highlights/:id', async (req, res) => {
  const { title, text, icon_name } = req.body;
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'UPDATE highlights SET title = $1, text = $2, icon_name = $3 WHERE id = $4',
      [title, text, icon_name, id]
    );
    res.json({ message: 'Highlight updated successfully', changes: rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Certificate endpoints ──

app.post('/api/certificates', async (req, res) => {
  const { id, course_slug, course_title, user_email, user_name, completed_at } = req.body;
  if (!id || !course_slug || !course_title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      `INSERT INTO certificates (id, course_slug, course_title, user_email, user_name, completed_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) DO NOTHING`,
      [id, course_slug, course_title, user_email || '', user_name || '', completed_at || '']
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/certificates', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email query param required' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM certificates WHERE user_email = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/certificates/verify/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ valid: false, error: 'Certificate not found' });
    res.json({ valid: true, certificate: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Analytics endpoints ──

app.post('/api/analytics/track', async (req, res) => {
  const { visitorId, email, name, courseSlug, lessonTitle, referrer, action } = req.body;
  if (!visitorId) {
    return res.status(400).json({ error: 'Missing visitorId' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM visitor_analytics WHERE visitor_id = $1', [visitorId]);
    const row = rows[0];

    if (!row) {
      let purchasedList = [];
      if (action === 'purchase' && courseSlug) {
        purchasedList.push(courseSlug);
      }

      const insertRes = await pool.query(
        `INSERT INTO visitor_analytics (
          visitor_id, email, name, purchased_courses, visit_count, active_lesson, referrer, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          visitorId,
          email || 'Anonymous',
          name || 'Anonymous',
          JSON.stringify(purchasedList),
          1,
          lessonTitle || '',
          referrer || 'Direct'
        ]
      );
      res.json({ success: true, visitorId, id: insertRes.rows[0].id });
    } else {
      let visitCount = row.visit_count;
      if (action === 'visit') {
        visitCount += 1;
      }

      let purchasedList = [];
      try {
        purchasedList = JSON.parse(row.purchased_courses || '[]');
      } catch (e) {
        purchasedList = [];
      }

      if (action === 'purchase' && courseSlug && !purchasedList.includes(courseSlug)) {
        purchasedList.push(courseSlug);
      }

      let activeLesson = row.active_lesson;
      if (action === 'learn' && lessonTitle) {
        activeLesson = lessonTitle;
      }

      if (action === 'learn' && courseSlug && !purchasedList.includes(courseSlug)) {
        purchasedList.push(courseSlug);
      }

      const updatedEmail = email && email !== 'Anonymous' ? email : row.email;
      const updatedName = name && name !== 'Anonymous' ? name : row.name;

      const { rowCount } = await pool.query(
        `UPDATE visitor_analytics SET
          email = $1,
          name = $2,
          purchased_courses = $3,
          visit_count = $4,
          active_lesson = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE visitor_id = $6`,
        [
          updatedEmail,
          updatedName,
          JSON.stringify(purchasedList),
          visitCount,
          activeLesson,
          visitorId
        ]
      );
      res.json({ success: true, changes: rowCount });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM visitor_analytics ORDER BY updated_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analytics/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM visitor_analytics');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analytics/seed', async (req, res) => {
  const mockData = [
    {
      visitor_id: 'v_mock_alice',
      email: 'alice.vance@linkedin.com',
      name: 'Alice Vance',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 14,
      active_lesson: 'CompTIA Security+ - 1.3 Symmetric vs Asymmetric Cryptography',
      referrer: 'LinkedIn',
      created_offset: `INTERVAL '1 day'`,
      updated_offset: `INTERVAL '0 day'`
    },
    {
      visitor_id: 'v_mock_bob',
      email: 'bob.miller@gmail.com',
      name: 'Bob Miller',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 8,
      active_lesson: 'CompTIA Security+ - 2.1 Threat Actors & Vectors',
      referrer: 'Google',
      created_offset: `INTERVAL '2 days'`,
      updated_offset: `INTERVAL '1 day'`
    },
    {
      visitor_id: 'v_mock_charlie',
      email: 'charlie.codes@github.com',
      name: 'Charlie Smith',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 22,
      active_lesson: 'CompTIA Security+ - 3.2 Port Scanning Practice',
      referrer: 'GitHub',
      created_offset: `INTERVAL '5 days'`,
      updated_offset: `INTERVAL '3 days'`
    },
    {
      visitor_id: 'v_mock_anonymous1',
      email: 'Anonymous',
      name: 'Anonymous',
      purchased_courses: '[]',
      visit_count: 3,
      active_lesson: '',
      referrer: 'Twitter',
      created_offset: `INTERVAL '12 days'`,
      updated_offset: `INTERVAL '10 days'`
    },
    {
      visitor_id: 'v_mock_david',
      email: 'david.k@yahoo.com',
      name: 'David K.',
      purchased_courses: '[]',
      visit_count: 1,
      active_lesson: '',
      referrer: 'Direct',
      created_offset: `INTERVAL '2 days'`,
      updated_offset: `INTERVAL '1 day'`
    },
    {
      visitor_id: 'v_mock_emma',
      email: 'emma.watson@edu.org',
      name: 'Emma Watson',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 5,
      active_lesson: 'CompTIA Security+ - 1.1 Intro to Network Security',
      referrer: 'Google',
      created_offset: `INTERVAL '1 day'`,
      updated_offset: `INTERVAL '0 day'`
    }
  ];

  try {
    await pool.query('DELETE FROM visitor_analytics');
    
    for (const item of mockData) {
      await pool.query(`
        INSERT INTO visitor_analytics (visitor_id, email, name, purchased_courses, visit_count, active_lesson, referrer, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP - ${item.created_offset}, CURRENT_TIMESTAMP - ${item.updated_offset})
      `, [
        item.visitor_id,
        item.email,
        item.name,
        item.purchased_courses,
        item.visit_count,
        item.active_lesson,
        item.referrer
      ]);
    }
    res.json({ success: true, message: 'Mock analytics data seeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
