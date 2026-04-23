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
