import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'svelte/prefer-svelte-reactivity': 'off',
			// a2o.kr is a root-hosted static site with no base path.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{ files: ['**/*.svelte'], languageOptions: { parserOptions: { parser: ts.parser } } },
	{
		ignores: [
			'.tmp/**',
			'.svelte-kit/**',
			'build/**',
			'artifacts/**',
			'playwright-report/**',
			'test-results/**'
		]
	}
);
