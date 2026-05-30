const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const pool = require('./db');
const { registerCourseRoutes } = require('./coursesApi');

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || '';
const ADMIN_TOKEN_TTL_SECONDS = Number(process.env.ADMIN_TOKEN_TTL_SECONDS || 60 * 60 * 8);

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  const list = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (list.length > 0) return list;
  return ['http://localhost:5173'];
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createAdminToken() {
  const exp = Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto
    .createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
  if (!safeEqual(signature, expected)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || Number(decoded.exp) < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function isAdminRequest(req) {
  if (!ADMIN_TOKEN_SECRET) {
    return false;
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return verifyAdminToken(token);
}

app.locals.requireAdmin = requireAdmin;
app.locals.isAdminRequest = isAdminRequest;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = parseAllowedOrigins();
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '2mb' }));

app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_USER || !ADMIN_PASSWORD || !ADMIN_TOKEN_SECRET) {
    return res.status(500).json({ error: 'Admin auth is not configured on server.' });
  }

  const { userId, password } = req.body || {};
  if (!safeEqual(userId, ADMIN_USER) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createAdminToken();
  res.json({ token, expiresIn: ADMIN_TOKEN_TTL_SECONDS });
});

app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM content LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/content/:id', requireAdmin, async (req, res) => {
  const { title, description, button_text } = req.body;
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      'UPDATE content SET title = $1, description = $2, button_text = $3 WHERE id = $4',
      [title, description, button_text, id]
    );
    res.json({ message: 'Content updated successfully', changes: rowCount });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

registerCourseRoutes(app, pool);

app.get('/api/highlights', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM highlights ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/highlights/:id', requireAdmin, async (req, res) => {
  const { title, text, icon_name } = req.body;
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'UPDATE highlights SET title = $1, text = $2, icon_name = $3 WHERE id = $4',
      [title, text, icon_name, id]
    );
    res.json({ message: 'Highlight updated successfully', changes: rowCount });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM visitor_analytics ORDER BY updated_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analytics/clear', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM visitor_analytics');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analytics/seed', requireAdmin, async (req, res) => {
  const mockData = [
    {
      visitor_id: 'v_mock_alice',
      email: 'learner1@example.com',
      name: 'Learner One',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 14,
      active_lesson: 'CompTIA Security+ - 1.3 Symmetric vs Asymmetric Cryptography',
      referrer: 'LinkedIn',
      created_offset: `INTERVAL '1 day'`,
      updated_offset: `INTERVAL '0 day'`
    },
    {
      visitor_id: 'v_mock_bob',
      email: 'learner2@example.com',
      name: 'Learner Two',
      purchased_courses: JSON.stringify(['network-security']),
      visit_count: 8,
      active_lesson: 'CompTIA Security+ - 2.1 Threat Actors & Vectors',
      referrer: 'Google',
      created_offset: `INTERVAL '2 days'`,
      updated_offset: `INTERVAL '1 day'`
    },
    {
      visitor_id: 'v_mock_charlie',
      email: 'learner3@example.com',
      name: 'Learner Three',
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
      email: 'learner4@example.com',
      name: 'Learner Four',
      purchased_courses: '[]',
      visit_count: 1,
      active_lesson: '',
      referrer: 'Direct',
      created_offset: `INTERVAL '2 days'`,
      updated_offset: `INTERVAL '1 day'`
    },
    {
      visitor_id: 'v_mock_emma',
      email: 'learner5@example.com',
      name: 'Learner Five',
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
