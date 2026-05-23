# Agent guide — Database (SQLite)

## Location

- **File:** `server/database.sqlite`
- **Connection:** `server/db.js` — single shared `sqlite3.Database` instance, exported as `module.exports`

The DB file is created automatically on first server start if missing.

## Tables

### `content`

Legacy hero / landing copy (used by `Hero.jsx` fetch to `/api/content`).

| Column | Type |
| ------ | ---- |
| id | INTEGER PK |
| title | TEXT |
| description | TEXT |
| button_text | TEXT |

Seeded once if empty (see `db.js`).

### `highlights`

Home page feature cards (3 rows typical).

| Column | Type |
| ------ | ---- |
| id | INTEGER PK |
| title | TEXT |
| text | TEXT |
| icon_name | TEXT | Lucide icon name string |

### `courses`

Primary entity for all course data.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | INTEGER PK | |
| title | TEXT | Required |
| description | TEXT | Required; short catalog blurb |
| cover_title | TEXT | Card/display title |
| cover_subtitle | TEXT | |
| level | TEXT | e.g. Beginner |
| duration | TEXT | e.g. 40 Hours |
| cta_text | TEXT | |
| image_url | TEXT | |
| slug | TEXT | URL segment; unique |
| price | REAL | Default 0 |
| published | INTEGER | 0 or 1 |
| content_markdown | TEXT | Legacy full markdown |
| quiz_json | TEXT | JSON string — legacy quiz array |
| content_blocks_json | TEXT | **Source of truth** for outline + lessons |
| detail_description | TEXT | Long overview on course detail page |
| learning_outcomes | TEXT | Often multiline bullet text |
| instructor_name | TEXT | |
| rating | REAL | Default 4.7 |
| student_count | TEXT | Display string |
| language | TEXT | |
| created_at | TEXT | SQLite datetime |
| updated_at | TEXT | |

## Migrations

`db.js` runs `CREATE TABLE IF NOT EXISTS` then **`migrateCourseColumns`**: compares `PRAGMA table_info(courses)` to `COURSE_COLUMNS` array and `ALTER TABLE ADD COLUMN` for any missing columns.

When adding a column:

1. Append to `COURSE_COLUMNS` in `db.js`: `['column_name', 'TEXT']` (or appropriate type).
2. Add field to `normalizeCoursePayload` / `mapCourseRow` in `courseHelpers.js`.
3. Update API INSERT/UPDATE in `coursesApi.js`.
4. Update client admin form + `buildCoursePayload`.

## `content_blocks_json` structure

Array of blocks. Typical markdown block:

```json
{
  "type": "markdown",
  "id": "ns-m01-11",
  "moduleTitle": "01 Network Foundations",
  "sectionTitle": "01 Network Foundations",
  "navTitle": "1.1 Security Introduction",
  "content": "# 1.1 Introduction...\n\n### 1. Core..."
}
```

Quiz block:

```json
{
  "type": "quiz",
  "id": "b-...",
  "moduleTitle": "...",
  "sectionTitle": "...",
  "question": "...",
  "options": ["A", "B", "C"],
  "correctIndex": 0
}
```

Optional per markdown block: `suggestedQuiz` array (see `suggestedQuiz.js` on client).

## Seeding

- **Network Security:** `npm run seed:network-security` → `server/scripts/seedNetworkSecurity.js`
- Source: `server/seeds/networkSecurityContent.js` + `server/seeds/lessons/*.md`
- Updates course where `slug = 'network-security'`

Lesson markdown files can be regenerated with `server/scripts/inlineRealLifeExamples.js` (callouts for §2/§3).

## Querying manually

```bash
cd server
sqlite3 database.sqlite
.tables
SELECT id, slug, title, published FROM courses;
```

## Do not

- Commit production user data in `database.sqlite` if it contains private content (check team policy).
- Drop columns in SQLite without a migration plan (SQLite lacks simple DROP COLUMN in older versions — prefer additive migrations).
- Edit `content_blocks_json` only in DB without syncing legacy `content_markdown` if admin save path expects both (use admin API or seed scripts).
