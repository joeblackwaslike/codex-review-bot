# Configuration

All configuration is done via environment variables. Set these in your Vercel project settings or in a local `.env` file for development.

## Required

| Variable | Description |
|---|---|
| `GITHUB_APP_ID` | Numeric GitHub App ID shown on the app settings page |
| `GITHUB_APP_PRIVATE_KEY` | RSA private key PEM. Paste the full key with literal `\n` for newlines: `"-----BEGIN RSA PRIVATE KEY-----\nMII...\n-----END RSA PRIVATE KEY-----"` |
| `GITHUB_WEBHOOK_SECRET` | Random string used to verify GitHub webhook signatures. Generate with `openssl rand -hex 32` |
| `OPENAI_API_KEY` | OpenAI API key. Must have access to the model set in `OPENAI_MODEL` |
| `REVIEW_ENABLED` | Set to `true` to allow the bot to submit reviews. Off by default as a safety switch |

## Optional

| Variable | Default | Description |
|---|---|---|
| `OPENAI_MODEL` | `gpt-5` | OpenAI model name passed to the Responses API |
| `REVIEW_COMMAND` | `/codex-review` | Slash command that triggers a manual review |
| `REVIEW_COMMENT_PREFIX` | `codex-review-bot` | Heading used at the top of every review body |
| `CUSTOM_REVIEW_PROMPT` | `Focus on correctness, security, regressions, and missing tests.` | Appended to the system prompt. Customize per-deployment to focus on your team's standards |

## Private key formatting

GitHub provides the private key as a `.pem` file. When pasting into Vercel, replace literal newlines with `\n`:

```bash
# On macOS — prints the key with \n escaped, ready to paste
awk 'NF {printf "%s\\n", $0}' your-key.pem | pbcopy
```

The bot normalizes `\n` back to real newlines at startup.

## Example `.env`

```env
GITHUB_APP_ID=1234567
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMII...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=replace-with-openssl-rand-hex-32
REVIEW_ENABLED=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5
REVIEW_COMMAND=/codex-review
REVIEW_COMMENT_PREFIX=codex-review-bot
CUSTOM_REVIEW_PROMPT=Focus on correctness, security, regressions, and missing tests.
```
