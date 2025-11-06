import { defineConfig } from "vite";

export default defineConfig(() => ({
	root: __dirname,
	cacheDir: "../../node_modules/.vite/packages/bullmq",
	plugins: [],
	esbuild: {
		target: "es2022",
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
			},
		},
	},
	test: {
		name: "@dwex/bullmq",
		watch: false,
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		reporters: ["default"],
		coverage: {
			reportsDirectory: "./test-output/vitest/coverage",
			provider: "v8" as const,
		},
	},
}));
