import { getConfig } from "./config.js";
import { getOpenAIClient } from "./openai.js";
import { buildPrompt } from "./prompt.js";

type OctokitLike = {
	request: <T>(
		route: string,
		params: Record<string, string | number>,
	) => Promise<{ data: T }>;
	paginate: <T>(
		route: string,
		params: Record<string, string | number>,
	) => Promise<T[]>;
};

interface PullFile {
	filename: string;
	status: string;
	patch?: string;
}

interface ReviewContext {
	octokit: OctokitLike;
	owner: string;
	repo: string;
	pullNumber: number;
	headSha: string;
	title: string;
	body: string | null;
	additions: number;
	deletions: number;
	changedFiles: number;
	commentPrefix: string;
	extraInstructions: string;
	force: boolean;
}

interface ReviewDecision {
	event: "COMMENT" | "REQUEST_CHANGES";
	body: string;
	comments: ReviewComment[];
}

interface ModelFinding {
	title: string;
	body: string;
}

interface ModelInlineComment {
	title: string;
	body: string;
	path: string;
	line: number;
	start_line?: number;
}

interface ModelReview {
	summary: string;
	event: "COMMENT" | "REQUEST_CHANGES";
	general_findings: ModelFinding[];
	inline_comments: ModelInlineComment[];
}

interface PullRequestReview {
	body?: string | null;
}

interface ReviewComment {
	path: string;
	body: string;
	line: number;
	side: "RIGHT";
	start_line?: number;
	start_side?: "RIGHT";
}

function safeJsonParse(text: string): ModelReview | null {
	try {
		return JSON.parse(text) as ModelReview;
	} catch {
		return null;
	}
}

function formatFindings(findings: ModelFinding[]): string {
	if (findings.length === 0) {
		return "";
	}

	return findings
		.map((finding) => {
			return `#### ${finding.title}\n\n${finding.body}`;
		})
		.join("\n\n");
}

export function collectRightSideLines(patch: string): Set<number> {
	const lines = new Set<number>();
	const patchLines = patch.split("\n");
	let nextRightLine = 0;

	for (const line of patchLines) {
		if (line.startsWith("@@")) {
			const match = /@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
			if (!match) {
				continue;
			}
			nextRightLine = Number(match[1]);
			continue;
		}

		if (line.startsWith("+")) {
			lines.add(nextRightLine);
			nextRightLine += 1;
			continue;
		}

		if (line.startsWith(" ")) {
			lines.add(nextRightLine);
			nextRightLine += 1;
			continue;
		}

		if (line.startsWith("-")) {
		}
	}

	return lines;
}

function buildCommentBody(comment: ModelInlineComment): string {
	return `**${comment.title}**\n\n${comment.body}`;
}

export function buildReviewComments(
	files: PullFile[],
	inlineComments: ModelInlineComment[],
): ReviewComment[] {
	const validLinesByPath = new Map<string, Set<number>>();

	for (const file of files) {
		if (!file.patch) {
			continue;
		}
		validLinesByPath.set(file.filename, collectRightSideLines(file.patch));
	}

	return inlineComments.flatMap((comment) => {
		const validLines = validLinesByPath.get(comment.path);
		if (!validLines?.has(comment.line)) {
			return [];
		}

		if (
			comment.start_line !== undefined &&
			comment.start_line >= comment.line
		) {
			return [];
		}

		const startLine =
			comment.start_line !== undefined ? comment.start_line : undefined;
		if (startLine !== undefined && !validLines.has(startLine)) {
			return [];
		}

		return [
			{
				path: comment.path,
				body: buildCommentBody(comment),
				line: comment.line,
				side: "RIGHT" as const,
				...(startLine !== undefined
					? { start_line: startLine, start_side: "RIGHT" as const }
					: {}),
			},
		];
	});
}

export async function buildReview(
	context: ReviewContext,
): Promise<ReviewDecision | null> {
	const reviewMarker = `Reviewed commit: \`${context.headSha.slice(0, 12)}\``;
	if (!context.force) {
		const existing = await context.octokit.request<PullRequestReview[]>(
			"GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
			{
				owner: context.owner,
				repo: context.repo,
				pull_number: context.pullNumber,
			},
		);

		const alreadyReviewed = existing.data.some((review) =>
			(review.body ?? "").includes(reviewMarker),
		);

		if (alreadyReviewed) {
			return null;
		}
	}

	const files = await context.octokit.paginate<PullFile>(
		"GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
		{
			owner: context.owner,
			repo: context.repo,
			pull_number: context.pullNumber,
		},
	);
	const config = getConfig();
	const client = getOpenAIClient();
	const prompt = buildPrompt({
		owner: context.owner,
		repo: context.repo,
		pullNumber: context.pullNumber,
		headSha: context.headSha,
		title: context.title,
		body: context.body,
		additions: context.additions,
		deletions: context.deletions,
		changedFiles: context.changedFiles,
		extraInstructions: context.extraInstructions,
		files,
	});

	const response = await client.responses.create({
		model: config.openAIModel,
		instructions:
			"You are a senior code reviewer. Produce concise, technically grounded output.",
		input: prompt,
		text: {
			format: {
				type: "json_schema",
				name: "review_output",
				strict: true,
				schema: {
					type: "object",
					additionalProperties: false,
					required: ["summary", "event", "general_findings", "inline_comments"],
					properties: {
						summary: {
							type: "string",
						},
						event: {
							type: "string",
							enum: ["COMMENT", "REQUEST_CHANGES"],
						},
						general_findings: {
							type: "array",
							items: {
								type: "object",
								additionalProperties: false,
								required: ["title", "body"],
								properties: {
									title: { type: "string" },
									body: { type: "string" },
								},
							},
						},
						inline_comments: {
							type: "array",
							items: {
								type: "object",
								additionalProperties: false,
								required: ["title", "body", "path", "line"],
								properties: {
									title: { type: "string" },
									body: { type: "string" },
									path: { type: "string" },
									line: { type: "integer" },
									start_line: { type: "integer" },
								},
							},
						},
					},
				},
			},
		},
	});

	const modelReview = safeJsonParse(response.output_text);
	if (!modelReview) {
		throw new Error("Model did not return valid review JSON");
	}

	const reviewComments = buildReviewComments(
		files,
		modelReview.inline_comments,
	).slice(0, 10);
	const findingsBlock = formatFindings(modelReview.general_findings);
	const inlineSummary =
		reviewComments.length > 0
			? `Inline comments: ${reviewComments.length}`
			: "Inline comments: none";
	const body = [
		`### ${context.commentPrefix}`,
		"",
		modelReview.summary,
		"",
		inlineSummary,
		findingsBlock ? `\n${findingsBlock}\n` : "",
		reviewMarker,
	]
		.filter((part) => part.length > 0)
		.join("\n");

	return {
		event: modelReview.event,
		body,
		comments: reviewComments,
	};
}
