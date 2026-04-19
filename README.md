# codex-review-bot

Minimal GitHub App pull request reviewer scaffold for Vercel.

It is designed to:

- receive GitHub App webhooks at `/api/github/webhook`
- authenticate as the app installation
- react to pull request events
- submit review comments as `codex-review-bot[bot]`
- run a custom OpenAI review prompt with a vendored code-review skill

By default, the app does not auto-review until you set `REVIEW_ENABLED=true`.

You can run it automatically on PR updates, or manually from a PR comment command.

## What This Scaffold Includes

- Vercel serverless webhook endpoint
- GitHub App webhook verification
- Installation-token review submission
- OpenAI-backed reviewer in [src/review.ts](/Users/joeblack/github/joeblackwaslike/codex-review-bot/src/review.ts:1)
- Prompt assembly in [src/prompt.ts](/Users/joeblack/github/joeblackwaslike/codex-review-bot/src/prompt.ts:1)
- Vendored skill guidance in [skills/code-review-excellence/SKILL.md](/Users/joeblack/github/joeblackwaslike/codex-review-bot/skills/code-review-excellence/SKILL.md:1)
- CI typecheck workflow

## Local Path

This repo was scaffolded at:

`~/github/joeblackwaslike/codex-review-bot`

## Setup

1. Create a GitHub App.
2. Give it:
   - `Pull requests: Read and write`
   - `Contents: Read-only`
   - `Metadata: Read-only`
   - `Issues: Read-only` for PR comment command webhooks
3. Enable the `Pull request` and `Issue comment` webhook events.
4. Install the app on the target repos.
5. Generate a private key for the app.
6. Add the environment variables shown in `.env.example`.
7. Deploy to Vercel.
8. Set the GitHub App webhook URL to:

`https://<your-vercel-domain>/api/github/webhook`

## Environment Variables

- `GITHUB_APP_ID`: numeric GitHub App ID
- `GITHUB_APP_PRIVATE_KEY`: app private key PEM, with `\n` newlines preserved
- `GITHUB_WEBHOOK_SECRET`: secret used to verify webhook signatures
- `REVIEW_ENABLED`: set to `true` to allow review submission
- `REVIEW_COMMENT_PREFIX`: prefix used in top-level review bodies
- `REVIEW_COMMAND`: slash command to trigger manual reviews, default `/codex-review`
- `OPENAI_API_KEY`: OpenAI API key used to run the review
- `OPENAI_MODEL`: model name for the Responses API, default `gpt-5`
- `CUSTOM_REVIEW_PROMPT`: your repo-specific review prompt appended after the skill guidance

## Default Review Logic

The reviewer now:

- fetches PR metadata and changed-file patches from GitHub
- loads the local `code-review-excellence` skill file
- appends your `CUSTOM_REVIEW_PROMPT`
- appends command-specific instructions from a PR comment trigger
- sends the assembled prompt to the OpenAI Responses API
- expects structured JSON back and converts that into a GitHub review with inline comments when anchors are valid

The bot validates model-provided line anchors against the actual diff and drops any invalid inline comments before submitting the review. The implementation lives in [src/review.ts](/Users/joeblack/github/joeblackwaslike/codex-review-bot/src/review.ts:1).

## Manual Trigger

On a pull request conversation, comment:

```text
/codex-review
```

With extra instructions:

```text
/codex-review focus on packaging and release risk
```

To force a rerun on the same commit:

```text
/codex-review --force
```

Only `OWNER`, `MEMBER`, and `COLLABORATOR` author associations are accepted by default.

## Deploy To Vercel

1. Create a new Vercel project from this repo.
2. Set the framework preset to `Other`.
3. Add the env vars from `.env.example`.
4. Deploy.

After deploy, use the resulting Vercel URL as the GitHub App `Webhook URL`.

## Local Development

If you do not have a public host yet, use `smee.io` temporarily:

1. Create a Smee channel.
2. Set the GitHub App `Webhook URL` to that Smee URL.
3. Run the forwarder locally.
4. Run `vercel dev`.

## Notes

- Reviews posted with installation auth appear as the app bot, not as your personal GitHub user.
- The OpenAI integration uses the Responses API. See the official docs: [Text generation](https://platform.openai.com/docs/guides/chat-completions), [Responses API reference](https://platform.openai.com/docs/api-reference/responses/retrieve), [Structured outputs](https://platform.openai.com/docs/guides/json-mode)
