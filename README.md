# CertNova

CertNova is a Security+ learning platform with:

- Marketing pages (`Home`, `About`, `Blog`, `Pricing`)
- Course catalog and lesson player
- Admin dashboard for authoring course content
- SQLite-backed Express API

## Tech Stack

- Frontend: React 18 + Vite
- Backend: Node.js + Express
- Database: SQLite
- Content: Markdown + PlantUML + quizzes

## Project Structure

```text
client/   # React app
server/   # Express API + SQLite + seeds
docs/     # Agent and project docs
```

## Getting Started

### 1. Run the API (port 5000)

```bash
cd server
npm install
node index.js
```

### 2. Run the frontend (port 5173)

```bash
cd client
npm install
npm run dev
```

Optional client env:

```bash
# client/.env
VITE_API_URL=http://localhost:5000
```

## Seed Course Content

```bash
cd server
npm run seed:network-security
```

## Key Paths

- `client/src/App.jsx` — routes and app shell
- `client/src/components/CourseLessonLayout.*` — lesson player UI
- `client/src/components/CertnovaMarkdown.jsx` — markdown + PlantUML rendering
- `client/src/admin/AdminDashboard.jsx` — admin authoring dashboard
- `server/index.js` — API entrypoint
- `server/db.js` — SQLite schema/migrations
- `server/coursesApi.js` — `/api/courses/*` endpoints
- `server/seeds/` — course seed content

## Notes

- Lesson content is DB-driven via `courses.content_blocks_json`
- Admin auth is currently localStorage-based in MVP mode
- Do not commit secrets (`.env`, API keys, local DB files)

