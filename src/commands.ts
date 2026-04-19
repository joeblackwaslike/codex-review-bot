export interface ReviewCommand {
	force: boolean;
	extraInstructions: string;
}

export function parseReviewCommand(
	body: string,
	commandName: string,
): ReviewCommand | null {
	const trimmed = body.trim();
	if (!trimmed.startsWith(commandName)) {
		return null;
	}

	const remainder = trimmed.slice(commandName.length).trim();
	if (!remainder) {
		return { force: false, extraInstructions: "" };
	}

	const parts = remainder.split(/\s+/);
	const extraParts: string[] = [];
	let force = false;

	for (const part of parts) {
		if (part === "--force") {
			force = true;
			continue;
		}
		extraParts.push(part);
	}

	return {
		force,
		extraInstructions: extraParts.join(" ").trim(),
	};
}

export function isTrustedAuthorAssociation(association: string): boolean {
	return ["OWNER", "MEMBER", "COLLABORATOR"].includes(association);
}
