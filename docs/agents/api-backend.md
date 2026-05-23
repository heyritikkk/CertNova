# Agent guide — API / Backend

## Server entry

- **File:** `server/index.js`
- **Port:** `process.env.PORT || 5000`
- **Middleware:** `cors()`, `express.json({ limit: '2mb' })`

## Route map

### Site content (legacy CMS)

| Method | Path | Handler |
| ------ | ---- | ------- |
| GET | `/api/content` | Single row from `content` table (hero copy) |
| PUT | `/api/content/:id` | Update `title`, `description`, `button_text` |

### Highlights (home page cards)

| Method | Path | Handler |
| ------ | ---- | ------- |
| GET | `/api/highlights` | All rows, ordered by `id` |
| PUT | `/api/highlights/:id` | Update `title`, `text`, `icon_name` |

### Courses (primary)

Registered in `server/coursesApi.js` via `registerCourseRoutes(app, db)`.

| Method | Path | Query / body | Notes |
| ------ | ---- | ------------ | ----- |
| GET | `/api/courses` | `?all=1` optional | Default: **published only**. `all=1` returns all (admin). |
| GET | `/api/courses/:idOrSlug` | `?all=1` optional | `idOrSlug` numeric id or string **slug** |
| POST | `/api/courses` | JSON body | Creates course; requires `title`, `description` |
| PUT | `/api/courses/:id` | JSON body | Full update by numeric **id** |
| PATCH | `/api/courses/:id/publish` | `{ published: true/false }` | Toggle publish |
| DELETE | `/api/courses/:id` | | Delete by id |

## Request / response shape (courses)

Normalization: `server/courseHelpers.js` → `normalizeCoursePayload(body)`.

Important fields:

```js
{
  title, description,
  cover_title, cover_subtitle,
  level, duration, cta_text, image_url,
  slug, price, published,           // published → 0/1 in DB
  content_markdown,                 // legacy string
  quiz,                             // array (also stored as quiz_json)
  content_blocks,                   // array (also stored as content_blocks_json)
  detail_description, learning_outcomes,
  instructor_name, rating, student_count, language
}
```

Response mapping: `mapCourseRow(row)` parses JSON fields and returns camelCase-friendly structure for the client (see file for exact shape).

**Slug:** auto-generated from title if missing; duplicates on insert get suffix `-{timestamp}`.

## Server-side content normalization

On save, `normalizeContentBlocksNavTitles` (`server/lib/navTitleWords.js`) clamps sidebar `navTitle` / section titles to **max 3 words**.

## Error pattern

```js
res.status(500).json({ error: err.message });
res.status(404).json({ error: 'Course not found' });
res.status(400).json({ error: 'Title and description are required.' });
```

## Adding a new endpoint

1. Add handler in `coursesApi.js` or `index.js`.
2. If new persisted fields: add column in `db.js` `COURSE_COLUMNS` + migration loop.
3. Extend `normalizeCoursePayload` and `mapCourseRow` in `courseHelpers.js`.
4. Extend `buildCoursePayload` / `api` object in `client/src/lib/api.js`.
5. Wire admin UI in `AdminDashboard.jsx` if admin-editable.

## Files

| File | Purpose |
| ---- | ------- |
| `server/index.js` | App bootstrap, content + highlights routes |
| `server/coursesApi.js` | All `/api/courses/*` routes |
| `server/courseHelpers.js` | Slugify, parse JSON, normalize/map payloads |
| `server/lib/navTitleWords.js` | Nav title word limit (server) |
| `server/lib/inlineRealLifeExamples.js` | Markdown post-processing for seeds |

## Do not

- Change API port without updating client `VITE_API_URL` or default in `api.js`.
- Store quiz/blocks only in legacy columns without updating `content_blocks_json` (admin saves both via normalization).
- Add authentication middleware without coordinating with client `localStorage` guards (currently MVP).
