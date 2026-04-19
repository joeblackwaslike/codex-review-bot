import { describe, expect, it, vi } from "vitest";
import handler from "./webhook.js";

const verifyAndReceive = vi.fn();

vi.mock("../../src/github-app.js", () => ({
	getGitHubApp: () => ({
		webhooks: {
			verifyAndReceive,
		},
	}),
}));

function createResponse() {
	return {
		statusCode: 200,
		headers: {} as Record<string, string>,
		body: undefined as unknown,
		setHeader(name: string, value: string) {
			this.headers[name] = value;
		},
		status(code: number) {
			this.statusCode = code;
			return this;
		},
		json(payload: unknown) {
			this.body = payload;
			return this;
		},
	};
}

describe("github webhook handler", () => {
	it("rejects non-POST requests", async () => {
		const req = {
			method: "GET",
			headers: {},
		};
		const res = createResponse();

		await handler(req as never, res as never);

		expect(res.statusCode).toBe(405);
		expect(res.headers.Allow).toBe("POST");
	});

	it("verifies and accepts valid webhook requests", async () => {
		verifyAndReceive.mockReset();
		verifyAndReceive.mockResolvedValue(undefined);

		const req = {
			method: "POST",
			headers: {
				"x-github-delivery": "delivery-1",
				"x-github-event": "pull_request",
				"x-hub-signature-256": "sha256=test",
			},
			async *[Symbol.asyncIterator]() {
				yield Buffer.from('{"ok":true}');
			},
		};
		const res = createResponse();

		await handler(req as never, res as never);

		expect(verifyAndReceive).toHaveBeenCalledWith({
			id: "delivery-1",
			name: "pull_request",
			signature: "sha256=test",
			payload: '{"ok":true}',
		});
		expect(res.statusCode).toBe(202);
	});
});
