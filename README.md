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
