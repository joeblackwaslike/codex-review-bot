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

The bot embeds a `Reviewed commit: <sha>` marker in every review body. Before submitting a new review, it fetches existing reviews and skips if the same SHA has already been reviewed. Use `--force` to bypass this check.
