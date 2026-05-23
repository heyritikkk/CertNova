# Agent guide — Overview & conventions

## Repository layout

```
CertNova/
├── client/                 # Vite + React SPA
│   ├── public/             # Static assets (e.g. blog/*.jpg)
│   └── src/
├── server/                 # Express API + SQLite
│   ├── database.sqlite     # Runtime DB (local)
│   ├── seeds/              # Course seed sources
│   └── scripts/            # One-off / seed runners
├── docs/agents/            # Agent documentation (this folder)
├── ADMIN_CONTENT_GUIDE.md  # Human markdown authoring reference
└── AGENTS.md               # Agent entry point
```

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| UI | React 18, React Router 6, Vite 5 |
| Styling | Plain CSS per component/page + `index.css` design tokens |
| Markdown | `react-markdown`, `remark-gfm`, custom `CertnovaMarkdown` |
| Diagrams | PlantUML via `PlantUMLRenderer` (remote SVG) |
| API | Express 5, `cors`, JSON body |
| Database | SQLite3 (`server/database.sqlite`) |

## Design tokens (`client/src/index.css`)

Common CSS variables:

- `--brand-accent`, `--brand-accent-soft`, `--brand-accent-deep`, `--brand-accent-border`
- `--site-max-width`, `--site-content-max-width`, `--site-gutter`
- `--navbar-offset`, `--heading-text-shadow`
- `--surface-brand-25` — lesson/panel tinted backgrounds (25% brand + white)

Dark mode: `[data-theme='dark']` on `<html>` (set from `App.jsx`).

## Content model (mental model)

1. **Course** — One row in `courses` table (title, slug, published, detail fields, etc.).
2. **Content blocks** — JSON array in `content_blocks_json`. Each block is `type: 'markdown' | 'quiz'`.
3. **Outline** — Derived from blocks via `moduleTitle`, `sectionTitle`, `navTitle` (see `contentBlocks.js`).
4. **Learn page** — `CourseLearn` → `CourseLessonLayout` loads course by slug, picks active block, renders markdown in `.lesson-prose`.

Legacy fields `content_markdown` and `quiz_json` are still synced from blocks when saving (`blocksToLegacyFields` in `contentBlocks.js`).

## Lesson markdown structure (authoring)

Standard sub-lesson sections:

1. `### 1. Core Technical Breakdown`
2. `### 2. Real-World Analogy` — each bullet may have nested `> *Real life example:*` callout
3. `### 3. Attack & Defense Lab Scenario` — Attack/Defense bullets + real life callouts
4. `### 4. Professor's Deep-Dive Notes` — `> *Professor's Tip:*` blockquote

## Scripts worth knowing

| Command | Location | Purpose |
| ------- | -------- | ------- |
| `npm run dev` | `client/` | Start Vite dev server |
| `node index.js` | `server/` | Start API |
| `npm run seed:network-security` | `server/` | Load NS course into SQLite |
| `node scripts/inlineRealLifeExamples.js` | `server/` | Rebuild §2/§3 callouts from git lesson sources |

## When adding a feature

1. Decide layer: UI only, API only, DB column, or seed content.
2. If course data changes: update `courseHelpers.js`, `api.js` `buildCoursePayload`, admin form, and optionally seeds.
3. If lesson rendering changes: `CertnovaMarkdown` + `certnova-prose.css` + `CourseLessonLayout`.
4. Keep admin preview and learn page using the **same** markdown component and prose styles.
