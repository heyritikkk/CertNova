# CertNova — Agent Guide

This file is the entry point for AI agents working in this repository. Read it first, then open the topic guide that matches your task.

## What this project is

CertNova is a **Security+ learning platform**: marketing site (home, about, blog, pricing), **course catalog**, **lesson player** (markdown + PlantUML + quizzes), and an **admin dashboard** to author courses. Data is stored in **SQLite** and served by an **Express** API. The UI is **React 18 + Vite**.

## Quick start

```bash
# Terminal 1 — API (port 5000)
cd server
npm install
node index.js

# Terminal 2 — UI (port 5173)
cd client
npm install
npm run dev
```

Optional env for the client: `client/.env` → `VITE_API_URL=http://localhost:5000`

Seed Network Security course content:

```bash
cd server
npm run seed:network-security
```

## Topic guides

| Guide | Use when you… |
| ----- | ------------- |
| [docs/agents/overview.md](docs/agents/overview.md) | Need repo layout, conventions, and cross-cutting rules |
| [docs/agents/ui-frontend.md](docs/agents/ui-frontend.md) | Change pages, components, CSS, routing, lesson layout |
| [docs/agents/api-backend.md](docs/agents/api-backend.md) | Add or change REST endpoints, payloads, server logic |
| [docs/agents/database.md](docs/agents/database.md) | Change schema, migrations, SQLite, course storage |
| [docs/agents/content-and-seeds.md](docs/agents/content-and-seeds.md) | Edit lessons, content blocks, seeds, markdown callouts |
| [docs/agents/admin.md](docs/agents/admin.md) | Work on AdminDashboard, editors, publish flow |

Human-facing lesson authoring: [ADMIN_CONTENT_GUIDE.md](ADMIN_CONTENT_GUIDE.md)

## Agent rules (always)

1. **Minimize scope** — Only change files required for the task. Match existing naming and patterns.
2. **Do not commit** unless the user explicitly asks.
3. **Do not push** unless the user explicitly asks.
4. **Courses are DB-driven** — Lesson text lives in `courses.content_blocks_json`, not hardcoded in React (except seeds).
5. **Shared markdown** — Lesson/admin preview uses `CertnovaMarkdown` + `client/src/styles/certnova-prose.css`.
6. **Nav titles** — Sidebar labels should be **2–3 words** (`navTitleWords.js` on client and server).
7. **No secrets in git** — Do not commit `.env`, API keys, or `database.sqlite` if the user treats it as local-only.

## Key paths (cheat sheet)

```
client/src/
  App.jsx                 # Routes, theme, auth guards
  lib/api.js              # Course API client
  lib/contentBlocks.js    # Block model, outline helpers
  components/
    CourseLessonLayout.*  # Learn page (sidebar + lesson)
    CourseContentBuilder.*# Admin lesson editor
    CertnovaMarkdown.jsx  # Markdown + PlantUML
  pages/                  # Route-level pages
  admin/AdminDashboard.jsx
  styles/certnova-prose.css

server/
  index.js                # Express app
  db.js                   # SQLite schema + migrations
  coursesApi.js           # /api/courses/*
  courseHelpers.js        # normalizeCoursePayload, mapCourseRow
  seeds/                  # networkSecurityContent.js, lessons/*.md
  scripts/seedNetworkSecurity.js
```

## Auth (current behavior)

- **Admin**: `localStorage.adminAuth === 'true'` after `/admin-login` (not server-verified in MVP).
- **Learner**: `localStorage.userAuth === 'true'` required for `/courses/:slug/learn`.

See [docs/agents/admin.md](docs/agents/admin.md) for details.
