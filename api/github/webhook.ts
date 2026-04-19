import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGitHubApp } from "../../src/github-app.js";
import { readRawBody } from "../../src/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({ error: "Method not allowed" });
		return;
	}

	const deliveryId = req.headers["x-github-delivery"];
	const eventName = req.headers["x-github-event"];
	const signature = req.headers["x-hub-signature-256"];

	if (
		typeof deliveryId !== "string" ||
		typeof eventName !== "string" ||
		typeof signature !== "string"
	) {
		res.status(400).json({ error: "Missing required GitHub headers" });
		return;
	}

	try {
		const body = await readRawBody(req);
		const app = getGitHubApp();

		await app.webhooks.verifyAndReceive({
			id: deliveryId,
			name: eventName as never,
			signature,
			payload: body.toString("utf8"),
		});

		res.status(202).json({ ok: true });
	} catch (error) {
		console.error("Webhook handling failed", error);
		res.status(500).json({ error: "Webhook handling failed" });
	}
}
