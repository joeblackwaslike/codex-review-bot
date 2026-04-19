import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const skillPath = fileURLToPath(
	new URL("../skills/code-review-excellence/SKILL.md", import.meta.url),
);

export interface PromptContext {
	owner: string;
	repo: string;
	pullNumber: number;
	headSha: string;
	title: string;
	body: string | null;
	additions: number;
	deletions: number;
	changedFiles: number;
	extraInstructions: string;
	files: Array<{
		filename: string;
		status: string;
		patch?: string;
	}>;
}

function trimPatch(patch: string, maxChars = 8000): string {
	if (patch.length <= maxChars) {
		return patch;
	}

	return `${patch.slice(0, maxChars)}\n\n[patch truncated]`;
}

function serializeFiles(files: PromptContext["files"]): string {
	return files
		.map((file) => {
			const header = `FILE: ${file.filename}\nSTATUS: ${file.status}`;
			const patch = file.patch
				? `PATCH:\n${trimPatch(file.patch)}`
				: "PATCH: [not available]";
			return `${header}\n${patch}`;
		})
		.join("\n\n---\n\n");
}

export function buildPrompt(context: PromptContext): string {
	const skillText = readFileSync(skillPath, "utf8");
	const customPrompt =
		process.env.CUSTOM_REVIEW_PROMPT ??
		"Focus on correctness, security, regressions, and missing tests.";
	const commandInstructionsSection = context.extraInstructions
		? ["", "Command-specific instructions:", context.extraInstructions]
		: [];

	return [
		"You are reviewing a GitHub pull request.",
		"",
		"Use the following skill guidance as review policy:",
		skillText,
		"",
		"Repo context:",
		`- Repository: ${context.owner}/${context.repo}`,
		`- Pull request: #${context.pullNumber}`,
		`- Head SHA: ${context.headSha}`,
		`- Title: ${context.title}`,
		`- Body: ${context.body ?? "[no description]"}`,
		`- Changed files: ${context.changedFiles}`,
		`- Added lines: ${context.additions}`,
		`- Deleted lines: ${context.deletions}`,
		"",
		"Custom prompt:",
		customPrompt,
		...commandInstructionsSection,
		"",
		"Changed file diffs:",
		serializeFiles(context.files),
		"",
		"Return JSON with this shape:",
		`{`,
		`  "summary": "short markdown summary",`,
		`  "event": "COMMENT" | "REQUEST_CHANGES",`,
		`  "general_findings": [`,
		`    {`,
		`      "title": "short finding title",`,
		`      "body": "one paragraph explanation",`,
		`    }`,
		`  ],`,
		`  "inline_comments": [`,
		`    {`,
		`      "title": "short finding title",`,
		`      "body": "one paragraph explanation",`,
		`      "path": "repo-relative file path",`,
		`      "line": 123,`,
		`      "start_line": 120`,
		`    }`,
		`  ]`,
		`}`,
		"",
		"Rules:",
		"- Only report material issues or meaningful risk.",
		"- If there are no material issues, use event COMMENT and return empty arrays.",
		"- Do not invent files.",
		"- Keep the summary concise.",
		"- Findings should focus on correctness, security, regressions, and testing gaps.",
		"- Only use inline comments for lines that appear in the provided diff.",
		"- Use `start_line` only for multi-line ranges, and only when `start_line` is less than `line`. Otherwise omit it.",
		"- Put unanchored concerns into `general_findings`, not `inline_comments`.",
	].join("\n");
}
