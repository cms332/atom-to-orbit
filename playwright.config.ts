import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	workers: 1,
	use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
	webServer: {
		command: 'bun run preview --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI
	},
	reporter: [
		['list'],
		['html', { open: 'never' }],
		['json', { outputFile: 'artifacts/verification-2026-10-19/playwright-results.json' }]
	],
	projects: [
		{ name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
		{
			name: 'mobile',
			use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
		}
	]
});
