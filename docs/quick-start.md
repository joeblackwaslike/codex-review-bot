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
4. Add the environment variables (see [Configuration](/configuration) for all options):

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
