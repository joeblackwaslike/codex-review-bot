# Design: Docs Site, README Polish & CI Automation

**Date:** 2026-04-23
**Status:** Approved

## Goal

Prepare `codex-review-bot` for social sharing by:

1. Building a polished VitePress docs site with a showcase-first landing page
2. Overhauling the README with badges and product-quality copy
3. Adding GitHub Actions for full CI, automated docs deploy, and GitHub Releases

---

## Site Structure

```
docs/
├── .vitepress/
│   ├── config.ts                  # nav, sidebar, base URL, og tags
│   └── theme/
│       ├── index.ts               # extends default theme, registers HeroDemo
│       ├── components/
│       │   └── HeroDemo.vue       # animated /codex-review → review demo
│       └── style.css              # minimal overrides (fonts, hero tweaks)
├── index.md                       # Home page (hero layout + HeroDemo + feature grid)
├── quick-start.md                 # Install → configure → first review in <10 min
├── configuration.md               # Every env var with defaults and examples
├── commands.md                    # /codex-review reference, flags, trust model
└── architecture.md                # Webhook → handler → OpenAI → GitHub flow
```

### Home Page Layout

1. **VitePress hero block** — tagline, sub-tagline, two CTA buttons (Quick Start, GitHub)
2. **`HeroDemo.vue`** — animated card (see below) mounted directly below the hero
3. **3-column feature grid** — AI-powered reviews, slash-command triggered, deploy in minutes
4. **"How it works" steps** — 4-step numbered list (install app → deploy → comment → review)

### HeroDemo.vue

A pure CSS-animated card cycling through three states:

1. PR comment appears: `/codex-review`
2. Spinner: "Analyzing 3 files…"
3. Review block appears: summary + one inline comment callout

No JS animation library. Uses CSS `@keyframes` + `animation-delay` on state layers. Styled to match GitHub's PR comment UI closely enough to be recognizable without being a pixel-perfect clone.

---

## GitHub Actions Workflows

### `.github/workflows/ci.yml` (update existing)

Triggers: push + PR to `main`

Steps: `checkout → setup-node@v4 (Node 22, npm cache) → npm ci → typecheck → lint → test`

Adds the missing `lint` step to the existing workflow. Pins Node to 22.

### `.github/workflows/docs.yml` (new)

Triggers: push to `main`

Steps:
```
checkout (fetch-depth: 0)
→ setup-node@v4 (Node 22, npm cache)
→ npm ci
→ npx vitepress build docs
→ peaceiris/actions-gh-pages@v3 (publish_dir: docs/.vitepress/dist, cname: omitted for now)
  # Using peaceiris over actions/deploy-pages: simpler config for VitePress, no extra permissions wrangling
```

GitHub Pages configured to serve from the `gh-pages` branch. `base` in `config.ts` set to `/codex-review-bot/` for the default GitHub Pages URL.

### `.github/workflows/release.yml` (new)

Triggers: push of `v*` tags

Steps: `checkout → setup-node@v4 → npm ci → typecheck → test → gh release create --generate-notes`

Auto-generates release notes from conventional commit messages.

---

## README Overhaul

### Badges (one row at top)

| Badge | Source |
|---|---|
| CI | `github/workflow/status` from `ci.yml` |
| License | MIT static shield |
| Node | `>=22` static shield |
| Docs | Link badge to GitHub Pages URL |
| Deploy | Vercel deploy badge API |

### Content Changes

- **Remove:** local path section (`~/github/joeblackwaslike/...`)
- **Remove:** absolute local file links (`/Users/joeblack/...`)
- **Replace:** "scaffold" language → confident product language
- **Add:** one-sentence opener ("codex-review-bot is a GitHub App that posts AI-powered code reviews...")
- **Add:** screenshot/preview section showing real review output from PR #1
- **Move:** OpenAI Responses API note → proper "How It Works" section
- **Update:** deploy URL references to use the live production URL

### New Files

- `LICENSE` — MIT, 2026, Joe Black
- `CONTRIBUTING.md` — fork → install → `vercel dev` → smee.io for local webhooks → PR

---

## Dependencies to Add

```
npm install -D vitepress
```

VitePress is dev-only. Docs build happens in CI, not at Vercel deploy time.

Add `docs:dev` and `docs:build` scripts to `package.json`:
```json
"docs:dev": "vitepress dev docs",
"docs:build": "vitepress build docs",
"docs:preview": "vitepress preview docs"
```

---

## Out of Scope

- Custom domain (`joeblack.nyc`) — tracked in `codex-review-bot-cw7`
- Search (VitePress local search enabled by default, no Algolia needed)
- i18n
- Versioned docs
