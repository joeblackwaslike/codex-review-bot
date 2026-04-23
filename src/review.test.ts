import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildReview,
	buildReviewComments,
	collectRightSideLines,
} from "./review.js";

const mockCreate = vi.fn();

vi.mock("./config.js", () => ({
	getConfig: () => ({
		appId: "1",
		privateKey: "pem",
		webhookSecret: "secret",
		reviewEnabled: true,
		reviewCommentPrefix: "codex-review-bot",
		reviewCommand: "/codex-review",
		openAIModel: "gpt-5",
	}),
}));

vi.mock("./openai.js", () => ({
	getOpenAIClient: () => ({
		responses: {
			create: mockCreate,
		},
	}),
}));

vi.mock("./prompt.js", () => ({
	buildPrompt: () => "prompt",
}));

describe("collectRightSideLines", () => {
	it("tracks right-side added and context lines from a patch", () => {
		const lines = collectRightSideLines(
			["@@ -10,2 +10,3 @@", " context", "+added", "-removed", " context2"].join(
				"\n",
			),
		);

		expect(Array.from(lines)).toEqual([10, 11, 12]);
	});
});

describe("buildReviewComments", () => {
	it("keeps only comments with valid right-side anchors", () => {
		const comments = buildReviewComments(
			[
				{
					filename: "src/file.ts",
					status: "modified",
					patch: ["@@ -1,2 +1,3 @@", " line1", "+line2", " line3"].join("\n"),
				},
			],
			[
				{
					title: "Valid",
					body: "Anchored correctly",
					path: "src/file.ts",
					line: 2,
					start_line: null,
				},
				{
					title: "Invalid path",
					body: "Wrong file",
					path: "src/other.ts",
					line: 2,
					start_line: null,
				},
				{
					title: "Invalid line",
					body: "Not in diff",
					path: "src/file.ts",
					line: 99,
					start_line: null,
				},
				{
					title: "Invalid range",
					body: "Backwards",
					path: "src/file.ts",
					line: 2,
					start_line: 3,
				},
			],
		);

		expect(comments).toHaveLength(1);
		expect(comments[0]).toMatchObject({
			path: "src/file.ts",
			line: 2,
			side: "RIGHT",
		});
	});
});

describe("buildReview", () => {
	beforeEach(() => {
		mockCreate.mockReset();
	});

	it("converts model output into a review with validated inline comments", async () => {
		mockCreate.mockResolvedValue({
			output_text: JSON.stringify({
				summary: "Two issues found.",
				event: "REQUEST_CHANGES",
				general_findings: [
					{
						title: "Missing test coverage",
						body: "This behavior change should be covered by a regression test.",
					},
				],
				inline_comments: [
					{
						title: "Bad anchor",
						body: "Should be dropped.",
						path: "src/review.ts",
						line: 99,
					},
					{
						title: "Valid anchor",
						body: "This is correctly anchored.",
						path: "src/review.ts",
						line: 2,
					},
				],
			}),
		});

		const octokit = {
			request: vi.fn().mockResolvedValue({ data: [] }),
			paginate: vi.fn().mockResolvedValue([
				{
					filename: "src/review.ts",
					status: "modified",
					patch: ["@@ -1,2 +1,3 @@", " line1", "+line2", " line3"].join("\n"),
				},
			]),
		};

		const review = await buildReview({
			octokit,
			owner: "joeblackwaslike",
			repo: "codex-review-bot",
			pullNumber: 1,
			headSha: "1234567890abcdef",
			title: "Test PR",
			body: "Example",
			additions: 1,
			deletions: 0,
			changedFiles: 1,
			commentPrefix: "codex-review-bot",
			extraInstructions: "",
			force: false,
		});

		expect(review).not.toBeNull();
		expect(review?.event).toBe("REQUEST_CHANGES");
		expect(review?.comments).toHaveLength(1);
		expect(review?.comments[0]).toMatchObject({
			path: "src/review.ts",
			line: 2,
		});
		expect(review?.body).toContain("Missing test coverage");
		expect(review?.body).toContain("Inline comments: 1");
	});

	it("skips duplicate reviews on the same commit unless forced", async () => {
		const octokit = {
			request: vi.fn().mockResolvedValue({
				data: [{ body: "Reviewed commit: `1234567890ab`" }],
			}),
			paginate: vi.fn(),
		};

		const review = await buildReview({
			octokit,
			owner: "joeblackwaslike",
			repo: "codex-review-bot",
			pullNumber: 1,
			headSha: "1234567890abcdef",
			title: "Test PR",
			body: "Example",
			additions: 1,
			deletions: 0,
			changedFiles: 1,
			commentPrefix: "codex-review-bot",
			extraInstructions: "",
			force: false,
		});

		expect(review).toBeNull();
		expect(octokit.paginate).not.toHaveBeenCalled();
	});
});
