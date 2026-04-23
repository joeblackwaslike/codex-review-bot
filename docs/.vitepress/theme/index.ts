import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import HeroDemo from "./components/HeroDemo.vue";
import "./style.css";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component("HeroDemo", HeroDemo);
	},
} satisfies Theme;
