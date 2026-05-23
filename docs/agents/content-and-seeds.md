# Agent guide — Content, seeds & markdown

## Authoring references

- **Agents / devs:** this file
- **Humans:** [ADMIN_CONTENT_GUIDE.md](../../ADMIN_CONTENT_GUIDE.md)

## Lesson file layout (4 sections)

Every sub-lesson should follow:

| # | Heading | Content |
| - | ------- | ------- |
| 1 | `### 1. Core Technical Breakdown` | Technical bullets, tables, diagrams — **no** callouts here |
| 2 | `### 2. Real-World Analogy` | Analogies; each bullet followed by indented `> *Real life example:* …` |
| 3 | `### 3. Attack & Defense Lab Scenario` | `* **The Attack …:**` / `* **The Defense …:**` + real life callouts |
| 4 | `### 4. Professor's Deep-Dive Notes` | Single `> *Professor's Tip:* …` blockquote (no emoji) |

Indent callouts with **two spaces** so they nest under the list item:

```markdown
* **Confidentiality:** Definition text…

  > *Real life example:* Analogy text…
```

## Markdown features

- GFM tables, lists, `**bold**`, `*italic*`, inline `` `code` ``
- Fenced code: ` ```bash `, ` ```text ` (ASCII diagrams)
- PlantUML: ` ```plantuml ` … ` ``` `
- Blockquotes: Professor tip (gray) vs real life example (peach) — styled via `markdownCallouts.js`

## Seed pipeline

```
server/seeds/lessons/1.1.md … 5.4.md     # Per-lesson markdown bodies
server/seeds/networkSecurityContent.js  # MODULES outline + buildNetworkSecurityBlocks()
server/scripts/seedNetworkSecurity.js   # Writes to SQLite
server/seeds/data/network-security-manual.md  # Full manual (optional import)
```

### Run seed

```bash
cd server
npm run seed:network-security
```

Creates/updates course slug **`network-security`** with ~25 blocks (5 module overviews + 20 lessons).

### Re-apply real-life callouts from git sources

```bash
node server/scripts/inlineRealLifeExamples.js
```

Uses `server/lib/inlineRealLifeExamples.js`:

- Restores §2 analogies as callouts under §1 bullets (when rebuilding from sources with §2 present)
- Adds callouts under §3 Attack/Defense bullets
- Strips §2 section after merge (content moves into callouts)

## Outline fields (per block)

| Field | Purpose |
| ----- | ------- |
| `moduleTitle` | Top accordion (e.g. `01 Network Foundations`) |
| `sectionTitle` | Section grouping within module |
| `navTitle` | Sidebar label — **2–3 words** + optional `1.1` prefix |
| `id` | Stable block id (e.g. `ns-m01-11`) |

Normalization:

- Client: `client/src/lib/navTitleWords.js`
- Server: `server/lib/navTitleWords.js` (on API save)

## Suggested quiz (optional)

Stored on markdown blocks as `suggestedQuiz` array. UI: `SuggestedQuiz.jsx` + `SuggestedQuizEditor.jsx`. Placeholder generator: `client/src/lib/suggestedQuiz.js`.

## PlantUML in content

Rendered at read time — no image upload. Large diagrams live in markdown fences only.

## Bulk content tasks

| Task | Approach |
| ---- | -------- |
| New course from scratch | Add seed module like `networkSecurityContent.js` + seed script, or use admin |
| Edit one lesson | Admin content tab, or edit `lessons/X.X.md` + re-seed |
| Fix all callout formatting | `inlineRealLifeExamples.js` then seed |
| Shorten sidebar titles | Update `shortNav` in seed or blur-save in admin (normalizes on save) |

## Do not

- Use emoji in Professor tips or real life callouts (project standard).
- Bold entire explanation paragraphs after bullet labels (bold **label** only).
- Put long titles in `navTitle` (breaks sidebar layout).
