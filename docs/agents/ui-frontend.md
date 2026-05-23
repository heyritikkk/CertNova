# Agent guide — UI / Frontend

## Entry points

| File | Role |
| ---- | ---- |
| `client/src/main.jsx` | Mount app, import global CSS + `certnova-prose.css` |
| `client/src/App.jsx` | Routes, `Layout` (Navbar/Footer/CtaBanner), theme, auth wrappers |
| `client/src/index.css` | Global tokens, typography, dark theme overrides |
| `client/src/App.css` | App shell, navbar offset on `main-content` |

## Routes

| Path | Component | Notes |
| ---- | --------- | ----- |
| `/` | `Home` | Hero, Highlights, HowItWorks, etc. |
| `/about` | `About` | |
| `/courses` | `Courses` | Published courses from API |
| `/courses/:slug` | `CourseDetail` | Overview via `CourseDetailOverview` |
| `/courses/:slug/learn` | `CourseLearn` | **Protected** — `CourseLessonLayout` |
| `/blog` | `Blog` | Mostly static; images in `public/blog/` |
| `/pricing` | `PricingPage` | |
| `/login` | `Login` | Sets `userAuth` in localStorage |
| `/admin-login` | `AdminLogin` | Sets `adminAuth` |
| `/admin` | `AdminDashboard` | **Protected** — course CRUD + editor |

`Layout` hides `CtaBanner` on paths ending with `/learn`.

## API client

`client/src/lib/api.js`:

- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:5000'`
- Course methods: `getPublishedCourses`, `getAllCourses`, `getCourse`, `createCourse`, `updateCourse`, `setPublished`, `deleteCourse`
- `buildCoursePayload(form)` — maps admin form → API body (includes `content_blocks`)

## Important components

### Marketing / shell

- `Navbar.jsx` + `Navbar.css` — fixed top bar; logo left, pill nav center, actions right
- `Footer.jsx`, `Hero.jsx`, `CtaBanner.jsx`
- Section components: `Highlights`, `HowItWorks`, `Testimonials`, `ReviewGrid`, `Pricing`, `Faq`

### Courses

- `CourseCard.jsx` — catalog card; uses `isCardReady()` from `api.js`
- `CourseDetailOverview.jsx` — hero, outcomes, syllabus from `content_blocks`
- `CourseLessonLayout.jsx` + `.css` — **learn experience**: sticky sidebar, resizable width (`lessonSidebarWidth.js`), scroll chrome, completion button, pager
- `CourseOutlineNav.jsx` / `CourseOutlineSidebar.jsx` — outline tree UI

### Markdown

- `CertnovaMarkdown.jsx` — `react-markdown` + GFM + PlantUML code fences
- `markdownCallouts.js` — adds `prose-callout--tip` / `prose-callout--example` on blockquotes
- `certnova-prose.css` — spacing, tables, callouts (shared: learn, admin preview, `CourseContentView`)

### Admin authoring

- `admin/AdminDashboard.jsx` — tabs: courses list, detail, content editor
- `CourseContentBuilder.jsx` — split markdown editor + live preview
- `SuggestedQuizEditor.jsx`, `QuizBuilder.jsx`, `PlantUmlAdminPanel.jsx`
- `MarkdownEditor.jsx` — toolbar helpers (`markdownToolbar.js`)

## Styling conventions

- One CSS file per major component/page (e.g. `Hero.css` beside `Hero.jsx`).
- Prefer CSS variables from `:root` over hardcoded peach hex when theming.
- Headings often use **Playfair Display**; UI text uses **Inter**.
- Course learn page uses `--lesson-*` variables inside `CourseLessonLayout.css`.

## Content blocks (client logic)

`client/src/lib/contentBlocks.js`:

- `createMarkdownBlock`, `createQuizBlock`
- `groupBlocksIntoModules`, `groupModuleItemsIntoSections`
- `blocksToLegacyFields` — sync to `content_markdown` / quiz for API
- `normalizeNavTitle` / import from `navTitleWords.js`

## PlantUML

- Fenced blocks: ` ```plantuml ` … ` ``` `
- `PlantUMLRenderer.jsx` fetches encoded diagram from PlantUML server
- Admin: `PlantUmlAdminPanel.jsx`, helpers in `plantUmlMarkdown.js`

## Common UI tasks

| Task | Where to edit |
| ---- | ------------- |
| New marketing page | `pages/NewPage.jsx`, route in `App.jsx`, CSS file |
| Lesson spacing/typography | `certnova-prose.css`, possibly `CourseLessonLayout.css` |
| Sidebar outline labels | Seed/admin `navTitle`; normalization in `navTitleWords.js` |
| Callout appearance | `certnova-prose.css` + `CertnovaMarkdown` blockquote handler |
| Course overview layout | `CourseDetailOverview.jsx` + `.css` |

## Do not

- Hardcode full lesson bodies in React for production courses (use DB/seeds).
- Duplicate markdown rendering logic outside `CertnovaMarkdown`.
- Break `/learn` sticky sidebar scroll behavior without testing desktop + mobile (`900px` breakpoint).
