import { defineConfig } from "vitepress";

export default defineConfig({
	title: "codex-review-bot",
	description:
		"AI-powered GitHub code reviews triggered by a slash command. Deploy in minutes.",
	base: "/codex-review-bot/",
	srcExclude: ["**/superpowers/**"],

	head: [
		["meta", { property: "og:type", content: "website" }],
		["meta", { property: "og:title", content: "codex-review-bot" }],
		[
			"meta",
			{
				property: "og:description",
				content:
					"AI-powered GitHub code reviews triggered by a slash command.",
			},
		],
		[
			"meta",
			{
				property: "og:image",
				content:
					"https://joeblackwaslike.github.io/codex-review-bot/og-image.png",
			},
		],
	],

	themeConfig: {
		nav: [
			{ text: "Quick Start", link: "/quick-start" },
			{ text: "Configuration", link: "/configuration" },
			{ text: "Commands", link: "/commands" },
			{ text: "Architecture", link: "/architecture" },
			{
				text: "GitHub",
				link: "https://github.com/joeblackwaslike/codex-review-bot",
			},
		],

		sidebar: [
			{ text: "Quick Start", link: "/quick-start" },
			{ text: "Configuration", link: "/configuration" },
			{ text: "Commands", link: "/commands" },
			{ text: "Architecture", link: "/architecture" },
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/joeblackwaslike/codex-review-bot",
			},
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 Joe Black",
		},

		search: { provider: "local" },

		editLink: {
			pattern:
				"https://github.com/joeblackwaslike/codex-review-bot/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},
	},
});
