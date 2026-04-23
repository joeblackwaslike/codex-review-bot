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
