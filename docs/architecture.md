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

The handler calls `app.webhooks.verifyAndReceive()` — which awaits all registered handlers — before sending `202 Accepted`. This means the Vercel function stays alive during the OpenAI API call (typically 5–20 seconds). GitHub's webhook timeout is 10 seconds; GitHub will mark the delivery as timed out but the review still posts successfully.

::: tip Improving latency
To respond 202 immediately and process in the background, move the review logic into a queued job (e.g. Vercel Queues or a background function). This is a known improvement opportunity.
:::

## Structured output schema

The bot uses OpenAI's Responses API with `strict: true` JSON schema. All properties declared in `properties` must appear in `required`. Optional fields use `["type", "null"]` instead of being omitted from `required`.
