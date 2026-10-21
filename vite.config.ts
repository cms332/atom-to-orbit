import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		watch: {
			ignored: ['**/.tmp/**', '**/artifacts/**', '**/playwright-report/**', '**/test-results/**']
		}
	},
	test: { include: ['src/**/*.test.ts'] }
});
