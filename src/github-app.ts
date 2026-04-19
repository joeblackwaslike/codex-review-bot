import { App } from "octokit";
import { isTrustedAuthorAssociation, parseReviewCommand } from "./commands.js";
import { getConfig } from "./config.js";
import { buildReview } from "./review.js";

type PullRequestWebhookPayload = {
	action: string;
	installation?: { id: number };
	number: number;
	pull_request: {
		draft: boolean;
		head: { sha: string };
		additions: number;
		deletions: number;
		changed_files: number;
		title: string;
		body: string | null;
	};
	repository: {
		name: string;
		owner: { login: string };
	};
};

type IssueCommentWebhookPayload = {
	action: string;
	installation?: { id: number };
	issue: {
		number: number;
		pull_request?: { url: string };
	};
	comment: {
		body: string;
		author_association: string;
	};
	repository: {
		name: string;
		owner: { login: string };
	};
};

type PullRequestDetails = {
	draft: boolean;
	head: { sha: string };
	additions: number;
	deletions: number;
	changed_files: number;
	title: string;
	body: string | null;
};

let appSingleton: App | null = null;

async function maybeSubmitReview(args: {
	app: App;
	installationId: number;
	owner: string;
	repo: string;
	pullNumber: number;
	pullRequest: PullRequestDetails;
	extraInstructions: string;
	force: boolean;
}) {
	const config = getConfig();
	const {
		app,
		installationId,
		owner,
		repo,
		pullNumber,
		pullRequest,
		extraInstructions,
		force,
	} = args;

	if (!config.reviewEnabled) {
		return;
	}

	if (pullRequest.draft) {
		return;
	}

	const headSha = pullRequest.head.sha;
	const octokit = await app.getInstallationOctokit(installationId);
	const review = await buildReview({
		octokit,
		owner,
		repo,
		pullNumber,
		headSha,
		title: pullRequest.title,
		body: pullRequest.body,
		additions: pullRequest.additions,
		deletions: pullRequest.deletions,
		changedFiles: pullRequest.changed_files,
		commentPrefix: config.reviewCommentPrefix,
		extraInstructions,
		force,
	});

	if (!review) {
		return;
	}

	await octokit.request(
		"POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
		{
			owner,
			repo,
			pull_number: pullNumber,
			commit_id: headSha,
			event: review.event,
			body: review.body,
			comments: review.comments,
		},
	);
}

function registerHandlers(app: App) {
	app.webhooks.on(
		[
			"pull_request.opened",
			"pull_request.reopened",
			"pull_request.synchronize",
		],
		async ({ payload }) => {
			const prPayload = payload as PullRequestWebhookPayload;

			const installationId = prPayload.installation?.id;
			if (!installationId) {
				throw new Error("Webhook payload did not include an installation id");
			}

			const owner = prPayload.repository.owner.login;
			const repo = prPayload.repository.name;
			const pullNumber = prPayload.number;
			await maybeSubmitReview({
				app,
				installationId,
				owner,
				repo,
				pullNumber,
				pullRequest: prPayload.pull_request,
				extraInstructions: "",
				force: false,
			});
		},
	);

	app.webhooks.on("issue_comment.created", async ({ payload }) => {
		const config = getConfig();
		const commentPayload = payload as IssueCommentWebhookPayload;

		if (!commentPayload.issue.pull_request) {
			return;
		}

		if (
			!isTrustedAuthorAssociation(commentPayload.comment.author_association)
		) {
			return;
		}

		const command = parseReviewCommand(
			commentPayload.comment.body,
			config.reviewCommand,
		);
		if (!command) {
			return;
		}

		const installationId = commentPayload.installation?.id;
		if (!installationId) {
			throw new Error("Webhook payload did not include an installation id");
		}

		const owner = commentPayload.repository.owner.login;
		const repo = commentPayload.repository.name;
		const pullNumber = commentPayload.issue.number;
		const octokit = await app.getInstallationOctokit(installationId);
		const pullResponse = await octokit.request(
			"GET /repos/{owner}/{repo}/pulls/{pull_number}",
			{
				owner,
				repo,
				pull_number: pullNumber,
			},
		);

		await maybeSubmitReview({
			app,
			installationId,
			owner,
			repo,
			pullNumber,
			pullRequest: pullResponse.data as PullRequestDetails,
			extraInstructions: command.extraInstructions,
			force: command.force,
		});
	});

	app.webhooks.onError((error) => {
		console.error("GitHub App webhook error", error);
	});
}

export function getGitHubApp(): App {
	if (appSingleton) {
		return appSingleton;
	}

	const config = getConfig();
	appSingleton = new App({
		appId: config.appId,
		privateKey: config.privateKey,
		webhooks: {
			secret: config.webhookSecret,
		},
	});

	registerHandlers(appSingleton);
	return appSingleton;
}
