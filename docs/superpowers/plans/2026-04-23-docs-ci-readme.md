# Docs Site, CI Automation & README Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a VitePress showcase docs site with animated hero demo, polish the README with badges and product copy, and automate CI, docs deploy, and GitHub Releases via GitHub Actions.

**Architecture:** VitePress docs live in `docs/` with a custom theme that extends the VitePress default. `HeroDemo.vue` is a pure-CSS animated card (three-state cycle: comment → spinner → review). GitHub Actions runs CI on every push, deploys docs to the `gh-pages` branch on every push to `main`, and creates a GitHub Release on `v*` tags. No JS animation libraries — CSS `@keyframes` only.

**Tech Stack:** VitePress 1.x, Vue 3 SFCs, peaceiris/actions-gh-pages@v4, shields.io badges, MIT license.

---

## File Map

**Create:**
- `docs/.vitepress/config.ts` — site config: nav, sidebar, base URL, og tags, local search
- `docs/.vitepress/theme/index.ts` — extends default theme, registers `HeroDemo` globally
- `docs/.vitepress/theme/components/HeroDemo.vue` — animated three-state PR demo
- `docs/.vitepress/theme/style.css` — minimal CSS overrides (hero spacing, demo card)
- `docs/index.md` — home page: hero layout with HeroDemo + 3-column feature grid
- `docs/quick-start.md` — install → configure → first review in under 10 min
- `docs/configuration.md` — every env var with type, default, and example
- `docs/commands.md` — `/codex-review` flags, trust model, examples
- `docs/architecture.md` — webhook → handler → OpenAI → GitHub flow with diagram
- `.github/workflows/docs.yml` — VitePress build + peaceiris deploy to gh-pages
- `.github/workflows/release.yml` — gh release create on v* tags
- `LICENSE` — MIT 2026 Joe Black
- `CONTRIBUTING.md` — fork → install → smee → vercel dev → PR

**Modify:**
- `package.json` — add `vitepress` dev dep + `docs:dev/build/preview` scripts
- `.github/workflows/ci.yml` — add `lint` step, pin Node to 22
- `README.md` — badges, product language, remove local paths, add screenshot section
- `.gitignore` — add `docs/.vitepress/dist` and `docs/.vitepress/cache`

---

## Task 1: Install VitePress and scaffold

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `docs/.vitepress/config.ts` (skeleton)
- Create: `docs/index.md` (skeleton)

- [ ] **Install VitePress**

```bash
npm install -D vitepress
```

- [ ] **Add docs scripts to `package.json`**

Add to the `"scripts"` block:

```json
"docs:dev": "vitepress dev docs",
"docs:build": "vitepress build docs",
"docs:preview": "vitepress preview docs"
```

- [ ] **Add VitePress output to `.gitignore`**

Append to `.gitignore`:

```
docs/.vitepress/dist
docs/.vitepress/cache
```

- [ ] **Create skeleton `docs/.vitepress/config.ts`**

```typescript
import { defineConfig } from "vitepress";

export default defineConfig({
	title: "codex-review-bot",
	description:
		"AI-powered GitHub code reviews triggered by a slash command. Deploy in minutes.",
	base: "/codex-review-bot/",
});
```

- [ ] **Create skeleton `docs/index.md`**

```markdown
# codex-review-bot

Hello from VitePress.
```

- [ ] **Verify VitePress dev server starts**

```bash
npm run docs:dev
```

Expected: server starts at `http://localhost:5173/codex-review-bot/`. Kill with Ctrl+C.

- [ ] **Commit**

```bash
git add package.json package-lock.json .gitignore docs/
git commit -m "chore: install vitepress and scaffold docs structure"
```

---

## Task 2: VitePress config — nav, sidebar, og tags, search

**Files:**
- Modify: `docs/.vitepress/config.ts`

- [ ] **Replace the skeleton config with the full config**

```typescript
import { defineConfig } from "vitepress";

export default defineConfig({
	title: "codex-review-bot",
	description:
		"AI-powered GitHub code reviews triggered by a slash command. Deploy in minutes.",
	base: "/codex-review-bot/",

	head: [
		["meta", { property: "og:type", content: "website" }],
		["meta", { property: "og:title", content: "codex-review-bot" }],
		[
			"meta",
			{
				property: "og:description",
				content:
					"AI-powered GitHub code reviews triggered by a slash command.",
			},
		],
		[
			"meta",
			{
				property: "og:image",
				content:
					"https://joeblackwaslike.github.io/codex-review-bot/og-image.png",
			},
		],
	],

	themeConfig: {
		nav: [
			{ text: "Quick Start", link: "/quick-start" },
			{ text: "Configuration", link: "/configuration" },
			{ text: "Commands", link: "/commands" },
			{ text: "Architecture", link: "/architecture" },
			{
				text: "GitHub",
				link: "https://github.com/joeblackwaslike/codex-review-bot",
			},
		],

		sidebar: [
			{ text: "Quick Start", link: "/quick-start" },
			{ text: "Configuration", link: "/configuration" },
			{ text: "Commands", link: "/commands" },
			{ text: "Architecture", link: "/architecture" },
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/joeblackwaslike/codex-review-bot",
			},
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 Joe Black",
		},

		search: { provider: "local" },

		editLink: {
			pattern:
				"https://github.com/joeblackwaslike/codex-review-bot/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},
	},
});
```

- [ ] **Verify build succeeds**

```bash
npm run docs:build
```

Expected: `docs/.vitepress/dist/` created, no errors.

- [ ] **Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "docs: configure vitepress nav, sidebar, og tags, search"
```

---

## Task 3: Custom theme + HeroDemo.vue

**Files:**
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/style.css`
- Create: `docs/.vitepress/theme/components/HeroDemo.vue`

- [ ] **Create `docs/.vitepress/theme/index.ts`**

```typescript
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import HeroDemo from "./components/HeroDemo.vue";
import "./style.css";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component("HeroDemo", HeroDemo);
	},
} satisfies Theme;
```

- [ ] **Create `docs/.vitepress/theme/style.css`**

```css
:root {
	--vp-home-hero-name-color: transparent;
	--vp-home-hero-name-background: linear-gradient(120deg, #4f86f7, #7c3aed);
	--vp-home-hero-image-background-image: none;
}

.hero-demo-wrapper {
	max-width: 760px;
	margin: 0 auto 48px;
	padding: 0 24px;
}
```

- [ ] **Create `docs/.vitepress/theme/components/HeroDemo.vue`**

```vue
<script setup lang="ts">
// No script logic needed — pure CSS animation
</script>

<template>
  <div class="hero-demo-wrapper">
    <div class="demo-window">
      <div class="demo-titlebar">
        <span class="dot dot-red" />
        <span class="dot dot-yellow" />
        <span class="dot dot-green" />
        <span class="demo-title">Pull Request #42 — Add utils module</span>
      </div>

      <div class="demo-body">
        <!-- State 1: user types /codex-review -->
        <div class="demo-state state-1">
          <div class="gh-comment">
            <div class="gh-avatar">JB</div>
            <div class="gh-bubble">
              <div class="gh-meta">joeblackwaslike <span>just now</span></div>
              <div class="gh-text"><span class="cmd">/codex-review</span></div>
            </div>
          </div>
        </div>

        <!-- State 2: analyzing spinner -->
        <div class="demo-state state-2">
          <div class="analyzing">
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>codex-review-bot is analyzing 3 files…</span>
          </div>
        </div>

        <!-- State 3: review appears -->
        <div class="demo-state state-3">
          <div class="gh-review">
            <div class="review-header">
              <span class="review-badge changes">Changes requested</span>
              <strong>codex-review-bot</strong>
            </div>
            <div class="review-summary">
              ### codex-review-bot<br /><br />
              Prototype pollution risk in <code>groupBy</code>. Use
              <code>Object.create(null)</code> or a <code>Map</code>.
              Inline comments: 2
            </div>
            <div class="inline-comment">
              <div class="inline-path">src/utils.ts +14</div>
              <div class="inline-body">
                Building result with <code>{}</code> allows prototype pollution
                when keys come from untrusted input.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Window chrome */
.demo-window {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.demo-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--vp-c-bg-elv);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot-red    { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green  { background: #28c840; }

.demo-title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* Animation container */
.demo-body {
  position: relative;
  height: 160px;
  overflow: hidden;
}

/* Three cycling states */
.demo-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 20px;
  opacity: 0;
  animation: cycle 9s infinite;
}

.state-1 { animation-delay: 0s; }
.state-2 { animation-delay: 3s; }
.state-3 { animation-delay: 6s; }

@keyframes cycle {
  0%   { opacity: 0; transform: translateY(4px); }
  8%   { opacity: 1; transform: translateY(0); }
  28%  { opacity: 1; transform: translateY(0); }
  36%  { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 0; }
}

/* State 1: GitHub comment */
.gh-comment {
  display: flex;
  gap: 12px;
  width: 100%;
}

.gh-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.gh-bubble {
  flex: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.gh-meta {
  padding: 6px 12px;
  background: var(--vp-c-bg-elv);
  font-size: 12px;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.gh-meta span { color: var(--vp-c-text-3); }

.gh-text {
  padding: 10px 12px;
  font-size: 14px;
}

.cmd {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* State 2: Analyzing */
.analyzing {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.spin {
  width: 20px;
  height: 20px;
  color: var(--vp-c-brand-1);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* State 3: Review */
.gh-review {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.review-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.review-badge.changes {
  background: #fef3c7;
  color: #92400e;
}

.dark .review-badge.changes {
  background: #451a03;
  color: #fde68a;
}

.review-summary {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.inline-comment {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  font-size: 12px;
}

.inline-path {
  padding: 4px 10px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  border-bottom: 1px solid var(--vp-c-divider);
}

.inline-body {
  padding: 6px 10px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
```

- [ ] **Verify the component compiles**

```bash
npm run docs:build
```

Expected: build succeeds, no Vue compilation errors.

- [ ] **Commit**

```bash
git add docs/.vitepress/theme/
git commit -m "docs: add custom theme with HeroDemo animated component"
```

---

## Task 4: Home page (index.md)

**Files:**
- Modify: `docs/index.md`

- [ ] **Replace skeleton with the full home page**

```markdown
---
layout: home

hero:
  name: "codex-review-bot"
  text: "AI code reviews on demand"
  tagline: "Comment /codex-review on any pull request. Get a structured review from GPT-5 in seconds — inline comments, security findings, and all."
  actions:
    - theme: brand
      text: Quick Start →
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/joeblackwaslike/codex-review-bot

features:
  - icon: 🤖
    title: AI-powered
    details: Uses OpenAI's GPT-5 via the Responses API with structured JSON output. Reviews are consistent, actionable, and never hallucinate file paths.
  - icon: 💬
    title: Slash-command triggered
    details: Comment /codex-review on any PR. Pass inline instructions — "/codex-review focus on security" — for targeted deep-dives.
  - icon: ⚡
    title: Deploy in minutes
    details: Fork, set 9 env vars, deploy to Vercel. Works with any GitHub repo your app is installed on. No infrastructure to manage.
---

<HeroDemo />
```

- [ ] **Verify home page renders with the demo component**

```bash
npm run docs:dev
```

Open `http://localhost:5173/codex-review-bot/`. Verify: hero text, feature grid, and animated demo card all render. Kill with Ctrl+C.

- [ ] **Commit**

```bash
git add docs/index.md
git commit -m "docs: add home page with hero layout and HeroDemo"
```

---

## Task 5: Content pages

**Files:**
- Create: `docs/quick-start.md`
- Create: `docs/configuration.md`
- Create: `docs/commands.md`
- Create: `docs/architecture.md`

- [ ] **Create `docs/quick-start.md`**

```markdown
# Quick Start

Get your first AI code review in under 10 minutes.

## Prerequisites

- A GitHub account with permission to create GitHub Apps
- A [Vercel](https://vercel.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key with access to GPT-5

## Step 1 — Create a GitHub App

1. Go to **Settings → Developer settings → GitHub Apps → New GitHub App**
2. Set the app name (e.g. `my-review-bot`)
3. Set **Webhook URL** to a placeholder for now (`https://example.com`) — you'll update this after deploy
4. Set **Webhook secret** to a random string — save it, you'll need it later
5. Grant these permissions:
   - **Pull requests**: Read and write
   - **Contents**: Read-only
   - **Metadata**: Read-only
   - **Issues**: Read-only
6. Subscribe to these events:
   - **Pull request**
   - **Issue comment**
7. Click **Create GitHub App**
8. Note the **App ID** shown at the top of the app settings page
9. Scroll to **Private keys** and click **Generate a private key** — save the downloaded `.pem` file

## Step 2 — Deploy to Vercel

1. Fork this repo
2. Go to [vercel.com/new](https://vercel.com/new) and import your fork
3. Set framework preset to **Other**
4. Add the environment variables below (see [Configuration](/configuration) for all options):

```env
GITHUB_APP_ID=<your app ID>
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=<your webhook secret>
OPENAI_API_KEY=sk-...
REVIEW_ENABLED=true
```

5. Click **Deploy**
6. Copy the production URL (e.g. `https://my-review-bot.vercel.app`)

## Step 3 — Point the webhook at Vercel

1. Back in your GitHub App settings, set the **Webhook URL** to:
   `https://my-review-bot.vercel.app/api/github/webhook`
2. Save changes

## Step 4 — Install the app on a repo

1. In your GitHub App settings, click **Install App**
2. Select the repositories you want to review

## Step 5 — Trigger your first review

On any open pull request in an installed repo, comment:

```
/codex-review
```

The bot will reply with a structured review within 10–30 seconds depending on PR size.

## Local development

Use [smee.io](https://smee.io) to receive webhooks locally:

```bash
npm install -g smee-client
smee --url https://smee.io/<your-channel> --target http://localhost:3000/api/github/webhook
npm run dev
```
```

- [ ] **Create `docs/configuration.md`**

```markdown
# Configuration

All configuration is done via environment variables. Set these in your Vercel project settings or in a local `.env` file for development.

## Required

| Variable | Description |
|---|---|
| `GITHUB_APP_ID` | Numeric GitHub App ID shown on the app settings page |
| `GITHUB_APP_PRIVATE_KEY` | RSA private key PEM. Paste the full key with literal `\n` for newlines: `"-----BEGIN RSA PRIVATE KEY-----\nMII...\n-----END RSA PRIVATE KEY-----"` |
| `GITHUB_WEBHOOK_SECRET` | Random string used to verify GitHub webhook signatures. Generate with `openssl rand -hex 32` |
| `OPENAI_API_KEY` | OpenAI API key. Must have access to the model set in `OPENAI_MODEL` |

## Optional

| Variable | Default | Description |
|---|---|---|
| `REVIEW_ENABLED` | `false` | Set to `true` to allow the bot to submit reviews. Safety off-switch |
| `OPENAI_MODEL` | `gpt-5` | OpenAI model name passed to the Responses API |
| `REVIEW_COMMAND` | `/codex-review` | Slash command that triggers a manual review |
| `REVIEW_COMMENT_PREFIX` | `codex-review-bot` | Heading used at the top of every review body |
| `CUSTOM_REVIEW_PROMPT` | `Focus on correctness, security, regressions, and missing tests.` | Appended to the system prompt. Customize per-deployment to focus on your team's standards |

## Private key formatting

GitHub provides the private key as a `.pem` file. When pasting into Vercel, replace literal newlines with `\n`:

```bash
# On macOS — prints the key with \n escaped, ready to paste
cat your-key.pem | awk 'NF {printf "%s\\n", $0}' | pbcopy
```

The bot normalizes `\n` back to real newlines at startup.
```

- [ ] **Create `docs/commands.md`**

```markdown
# Commands

## `/codex-review`

Posts an AI code review as a GitHub Pull Request review on the current PR.

### Basic usage

```
/codex-review
```

### With extra instructions

Any text after the command is passed to the model as additional context:

```
/codex-review focus on security and authentication edge cases
/codex-review this is a hotfix — check for regressions only
/codex-review be extra strict about missing tests
```

### Force re-review

By default the bot skips PRs it has already reviewed at the same commit SHA. Use `--force` to override:

```
/codex-review --force
```

Flags and extra instructions can be combined in any order:

```
/codex-review --force check for dependency injection issues
```

## Trust model

The bot only responds to comments from users with these GitHub author associations:

| Association | Who |
|---|---|
| `OWNER` | The repository owner |
| `MEMBER` | A member of the organization that owns the repo |
| `COLLABORATOR` | Someone explicitly added as a collaborator |

Comments from other users (e.g. external contributors, bots) are silently ignored.

## Automatic reviews

If `REVIEW_ENABLED=true`, the bot also triggers automatically on:

- `pull_request.opened`
- `pull_request.reopened`
- `pull_request.synchronize` (new commits pushed)

Draft PRs are skipped automatically.

## Deduplication

The bot embeds a `Reviewed commit: \`<sha>\`` marker in every review body. Before submitting a new review, it fetches existing reviews and skips if the same SHA has already been reviewed. Use `--force` to bypass this check.
```

- [ ] **Create `docs/architecture.md`**

```markdown
# Architecture

## Request flow

```
GitHub event
  → POST /api/github/webhook
  → signature verification (HMAC-SHA256)
  → octokit webhook dispatch
  → issue_comment.created handler
    → parse /codex-review command
    → trust check (author association)
    → GET /pulls/{number} (fetch PR metadata)
    → GET /pulls/{number}/files (fetch diffs)
    → build prompt (skill + custom prompt + diffs)
    → OpenAI Responses API (structured JSON output)
    → validate inline comment anchors against diff
    → POST /pulls/{number}/reviews
  → 202 Accepted
```

## Key files

| File | Responsibility |
|---|---|
| `api/github/webhook.ts` | Vercel entrypoint: reads raw body, verifies signature, dispatches event |
| `src/github-app.ts` | Registers webhook event handlers, manages the Octokit `App` singleton |
| `src/review.ts` | Fetches diff, calls OpenAI, validates anchors, builds `ReviewDecision` |
| `src/prompt.ts` | Assembles the full prompt from skill file + metadata + diffs |
| `src/commands.ts` | Parses `/codex-review` command body, extracts flags and extra instructions |
| `src/config.ts` | Reads and validates all environment variables at startup |
| `src/openai.ts` | Creates and caches the OpenAI client singleton |
| `skills/code-review-excellence/SKILL.md` | Vendored review policy loaded into every prompt |

## Anchor validation

The OpenAI model returns inline comments with `path`, `line`, and optional `start_line`. Before submitting:

1. The bot builds a set of valid right-side line numbers for each file from the raw diff
2. Any comment whose `line` is not in that set is dropped
3. Any comment whose `start_line >= line` (backwards range) is dropped
4. Any comment whose `start_line` is not in the valid set is dropped

This prevents the model from hallucinating line numbers that don't exist in the diff.

## Webhook response timing

The handler calls `app.webhooks.verifyAndReceive()` — which awaits all registered handlers — before sending `202 Accepted`. This means the Vercel function stays alive during the OpenAI API call (typically 5–20 seconds). GitHub's webhook timeout is 10 seconds; GitHub will mark the delivery as timed out but the review still posts successfully. This is a known trade-off.

::: tip Improving latency
To respond 202 immediately and process in the background, move the review logic into a queued job (e.g. Vercel Queues or a background function). This is tracked as a future improvement.
:::

## Structured output schema

The bot uses OpenAI's Responses API with `strict: true` JSON schema. All properties declared in `properties` must appear in `required`. Optional fields use `["type", "null"]` instead of being omitted.
```

- [ ] **Verify all pages build**

```bash
npm run docs:build
```

Expected: no errors, `docs/.vitepress/dist/` contains `index.html`, `quick-start.html`, `configuration.html`, `commands.html`, `architecture.html`.

- [ ] **Commit**

```bash
git add docs/quick-start.md docs/configuration.md docs/commands.md docs/architecture.md
git commit -m "docs: add quick-start, configuration, commands, and architecture pages"
```

---

## Task 6: Update ci.yml

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Replace `ci.yml` with the updated version**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test
```

- [ ] **Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint step and pin node to 22"
```

---

## Task 7: Docs deploy workflow

**Files:**
- Create: `.github/workflows/docs.yml`

- [ ] **Create `.github/workflows/docs.yml`**

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - run: npm ci

      - name: Build docs
        run: npm run docs:build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
          publish_branch: gh-pages
          user_name: "github-actions[bot]"
          user_email: "github-actions[bot]@users.noreply.github.com"
```

- [ ] **Commit**

```bash
git add .github/workflows/docs.yml
git commit -m "ci: add docs deploy workflow to gh-pages on push to main"
```

---

## Task 8: Release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Create `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Create GitHub Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create "${{ github.ref_name }}" \
            --title "${{ github.ref_name }}" \
            --generate-notes \
            --verify-tag
```

- [ ] **Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow with auto-generated changelog on v* tags"
```

---

## Task 9: README overhaul

**Files:**
- Modify: `README.md`

- [ ] **Replace `README.md` with the polished version**

```markdown
# codex-review-bot

[![CI](https://github.com/joeblackwaslike/codex-review-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/joeblackwaslike/codex-review-bot/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://joeblackwaslike.github.io/codex-review-bot/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](package.json)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://vercel.com/joe-blacks-projects/codex-review-bot)

**codex-review-bot** is a GitHub App that posts AI-powered code reviews when you comment `/codex-review` on a pull request. It runs on Vercel, uses OpenAI's GPT-5 via the Responses API, and submits structured reviews with inline comments anchored to the actual diff.

> **[Full documentation →](https://joeblackwaslike.github.io/codex-review-bot/)**

## How it works

1. Comment `/codex-review` on any pull request
2. The bot fetches the diff and PR metadata from GitHub
3. It builds a prompt from the diff, a vendored code-review skill, and your custom review policy
4. GPT-5 returns a structured JSON review with a summary, general findings, and inline comments
5. The bot validates every inline comment anchor against the actual diff, then submits the review

## Quick start

See the **[Quick Start guide](https://joeblackwaslike.github.io/codex-review-bot/quick-start)** for full setup instructions. The short version:

1. Create a GitHub App with PR read/write + contents read + issues read
2. Fork this repo and deploy to Vercel
3. Set the 5 required environment variables
4. Install the app on your repos
5. Comment `/codex-review` on a PR

## Commands

```text
/codex-review                              # standard review
/codex-review focus on security            # with extra instructions
/codex-review --force                      # re-review same commit
/codex-review --force check for regressions
```

Only `OWNER`, `MEMBER`, and `COLLABORATOR` author associations are accepted.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_APP_ID` | ✓ | — | Numeric GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | ✓ | — | RSA private key PEM (use `\n` for newlines) |
| `GITHUB_WEBHOOK_SECRET` | ✓ | — | HMAC secret for webhook signature verification |
| `OPENAI_API_KEY` | ✓ | — | OpenAI API key |
| `REVIEW_ENABLED` | ✓ | `false` | Set to `true` to enable review submission |
| `OPENAI_MODEL` | — | `gpt-5` | Model passed to the Responses API |
| `REVIEW_COMMAND` | — | `/codex-review` | Slash command to trigger reviews |
| `REVIEW_COMMENT_PREFIX` | — | `codex-review-bot` | Heading in review body |
| `CUSTOM_REVIEW_PROMPT` | — | `Focus on correctness...` | Appended to the prompt |

See [`.env.example`](.env.example) for a ready-to-copy template.

## Development

```bash
npm install
npm run dev          # vercel dev (local server)
npm run typecheck    # tsc --noEmit
npm run lint         # biome check
npm run test         # vitest run
npm run docs:dev     # vitepress docs server
```

Use [smee.io](https://smee.io) to receive live webhooks locally during development.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
```

- [ ] **Commit**

```bash
git add README.md
git commit -m "docs: overhaul README with badges, product copy, and env var table"
```

---

## Task 10: LICENSE and CONTRIBUTING.md

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`

- [ ] **Create `LICENSE`**

```text
MIT License

Copyright (c) 2026 Joe Black

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Create `CONTRIBUTING.md`**

```markdown
# Contributing

## Setup

```bash
git clone https://github.com/joeblackwaslike/codex-review-bot.git
cd codex-review-bot
npm install
cp .env.example .env   # fill in your values
```

## Local webhook testing

GitHub can't reach localhost directly. Use smee.io to proxy webhooks:

1. Go to [smee.io](https://smee.io) and create a channel
2. Set your GitHub App's Webhook URL to the smee URL
3. Run the forwarder:

```bash
npx smee-client --url https://smee.io/<your-channel> \
  --target http://localhost:3000/api/github/webhook
```

4. In a separate terminal:

```bash
npm run dev
```

## Code quality

```bash
npm run typecheck   # must pass
npm run lint        # must pass (biome)
npm run test        # must pass (vitest)
```

All three must pass before opening a PR.

## Docs

```bash
npm run docs:dev    # live-reload docs at localhost:5173/codex-review-bot/
npm run docs:build  # production build
```

## Pull request

- Use [conventional commits](https://www.conventionalcommits.org/) for commit messages
- One logical change per PR
- Update docs if you change behavior or add config options
```

- [ ] **Commit**

```bash
git add LICENSE CONTRIBUTING.md
git commit -m "chore: add MIT license and contributing guide"
```

---

## Task 11: Enable GitHub Pages and verify end-to-end

**Files:** none (manual GitHub settings step + push to verify CI)

- [ ] **Enable GitHub Pages on the repo**

This must be done once in the GitHub UI:

1. Go to `https://github.com/joeblackwaslike/codex-review-bot/settings/pages`
2. Under **Source**, select **Deploy from a branch**
3. Set branch to `gh-pages`, folder to `/ (root)`
4. Click Save

The `gh-pages` branch is created by the first docs deploy workflow run.

- [ ] **Push everything to main and confirm all workflows pass**

```bash
git push origin main
```

Go to `https://github.com/joeblackwaslike/codex-review-bot/actions` and verify:
- `CI` workflow: ✅ typecheck + lint + test pass
- `Deploy Docs` workflow: ✅ builds and pushes to `gh-pages`

- [ ] **Confirm docs site is live**

Open `https://joeblackwaslike.github.io/codex-review-bot/` (may take 1–2 minutes after first deploy).

Verify:
- Hero text and CTA buttons render
- Animated HeroDemo cycles through 3 states
- Feature grid shows 3 cards
- Nav links to Quick Start, Configuration, Commands, Architecture all work
- Dark mode toggle works

- [ ] **Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address any issues found during end-to-end verification"
git push origin main
```
