import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),tailwindcss(), svelte()],
	clearScreen: false,
	server: {
		port: 5173,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	build: {
		target:
			process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib"),
			$lang: path.resolve("./src/paraglide"),
		},
	},
});
