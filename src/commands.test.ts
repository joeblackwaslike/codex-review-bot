import { describe, expect, it } from "vitest";
import { isTrustedAuthorAssociation, parseReviewCommand } from "./commands.js";

describe("parseReviewCommand", () => {
	it("parses the bare review command", () => {
		expect(parseReviewCommand("/codex-review", "/codex-review")).toEqual({
			force: false,
			extraInstructions: "",
		});
	});

	it("parses extra instructions", () => {
		expect(
			parseReviewCommand(
				"/codex-review focus on packaging and release risk",
				"/codex-review",
			),
		).toEqual({
			force: false,
			extraInstructions: "focus on packaging and release risk",
		});
	});

	it("parses force and extra instructions together", () => {
		expect(
			parseReviewCommand(
				"/codex-review --force security only",
				"/codex-review",
			),
		).toEqual({
			force: true,
			extraInstructions: "security only",
		});
	});

	it("returns null for unrelated comments", () => {
		expect(parseReviewCommand("looks good to me", "/codex-review")).toBeNull();
	});
});

describe("isTrustedAuthorAssociation", () => {
	it("accepts trusted reviewer roles", () => {
		expect(isTrustedAuthorAssociation("OWNER")).toBe(true);
		expect(isTrustedAuthorAssociation("MEMBER")).toBe(true);
		expect(isTrustedAuthorAssociation("COLLABORATOR")).toBe(true);
	});

	it("rejects untrusted reviewer roles", () => {
		expect(isTrustedAuthorAssociation("CONTRIBUTOR")).toBe(false);
		expect(isTrustedAuthorAssociation("NONE")).toBe(false);
		expect(isTrustedAuthorAssociation("FIRST_TIMER")).toBe(false);
	});
});
