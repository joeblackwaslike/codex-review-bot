import { defineConfig } from "vitepress";

export default defineConfig({
	title: "codex-review-bot",
	description:
		"AI-powered GitHub code reviews triggered by a slash command. Deploy in minutes.",
	base: "/codex-review-bot/",
	srcExclude: ["**/superpowers/**"],
});
