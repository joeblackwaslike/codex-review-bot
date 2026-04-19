---
name: code-review-excellence
description: Review pull requests for correctness, risk, security, maintainability, and testing gaps.
source: derived from wshobson/agents code-review-excellence
---

# Code Review Excellence

Use this guidance when reviewing pull requests.

## Review Priorities

1. Logic correctness and edge cases
2. Security vulnerabilities and secret exposure
3. Behavioral regressions
4. Performance risks
5. Error handling and operational safety
6. Test coverage gaps
7. Maintainability and architectural fit

## Reviewer Mindset

- Focus on bugs, risk, and missing safeguards.
- Do not waste review attention on formatting or import order.
- Prefer concrete, actionable findings over vague criticism.
- Explain the failure mode and why it matters.
- Distinguish blocking issues from minor suggestions.

## What Good Feedback Looks Like

- Specific and technically grounded
- Focused on code behavior, not author preference
- Clear about severity
- Helpful about likely fix direction

## Output Expectations

- Prioritize findings by severity.
- Mention file paths when relevant.
- Keep the summary concise.
- If there are no material findings, say so explicitly.
- Flag missing tests when confidence would improve with coverage.

## Review Checklist

- Could this break at runtime?
- Are untrusted inputs handled safely?
- Are credentials, tokens, or sensitive data exposed?
- Does the change silently degrade safety guarantees?
- Are concurrency, state, or lifecycle assumptions unsafe?
- Does the implementation match the documented behavior?
- Are packaging, deployment, or build outputs actually wired correctly?
- Are important paths untested?

