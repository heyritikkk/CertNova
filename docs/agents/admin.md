# Agent guide — Admin dashboard & auth

## Access

| URL | Purpose |
| --- | ------- |
| `/admin-login` | Sets `localStorage.setItem('adminAuth', 'true')` on success |
| `/admin` | `AdminDashboard` — requires `adminAuth` |

Guard: `ProtectedRoute` in `App.jsx` (client-only; API does not verify admin token).

## AdminDashboard structure

**File:** `client/src/admin/AdminDashboard.jsx`  
**Styles:** `client/src/admin/AdminDashboard.css`

Typical flow:

1. **Courses list** — fetch `api.getAllCourses()`, publish toggle, delete, navigate to editor
2. **Course detail tab** — metadata: title, slug, description, detail page fields, outcomes, instructor, etc.
3. **Content tab** — `CourseContentBuilder` for `content_blocks`

Editor layout mode: `admin-container--course-editor` (full-height split view).

## Saving a course

Uses `buildCoursePayload(form)` from `client/src/lib/api.js`:

- Sends `content_blocks` array to API
- Server normalizes nav titles and stores `content_blocks_json` + legacy fields

Publish: `api.setPublished(id, true|false)` → `PATCH /api/courses/:id/publish`

## CourseContentBuilder

- **Files:** `CourseContentBuilder.jsx`, `CourseContentBuilder.css`
- Markdown textarea + **live preview** (`.admin-lesson-preview` + `CertnovaMarkdown`)
- Outline sidebar: reorder, add module/section/lesson, rename nav titles
- Integrates: `PlantUmlAdminPanel`, `SuggestedQuizEditor`, quiz blocks

Block helpers from `contentBlocks.js`: add/delete/reorder, `createMarkdownBlock`, `createQuizBlock`.

## Learner auth (separate)

| URL | Storage |
| --- | ------- |
| `/login` | `localStorage.userAuth = 'true'` |
| `/courses/:slug/learn` | `UserProtectedRoute` redirects to login with `?redirect=` |

Login is not wired to a backend user table in the current MVP.

## Hero content API (optional edit)

`Hero.jsx` still fetches `GET /api/content` but overrides title/description with constants in component — be aware if changing landing hero via API.

## Highlights

Home page `Highlights.jsx` may fetch `/api/highlights` — editable via API PUT if admin UI exists or manual DB update.

## Common admin tasks

| Task | Where |
| ---- | ----- |
| Add course field | `db.js`, `courseHelpers.js`, `AdminDashboard` form, `buildCoursePayload` |
| Fix preview ≠ learn styles | Ensure both use `CertnovaMarkdown` + `certnova-prose.css` |
| PlantUML tools in admin | `PlantUmlAdminPanel.jsx` |
| Markdown toolbar | `markdownToolbar.js` + `MarkdownEditor.jsx` |

## Do not

- Assume admin API routes are authenticated — they are open if port is reachable.
- Commit real admin passwords or production DB dumps.
