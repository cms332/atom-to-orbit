<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		label,
		summaryLabel,
		class: className = '',
		children
	}: { label: string; summaryLabel?: string; class?: string; children: Snippet } = $props();
</script>

<details class={`article-disclosure ${className}`}>
	<summary aria-label={summaryLabel}>{label}</summary>
	<div class="disclosure-content">{@render children()}</div>
</details>

<style>
	details {
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
	}
	summary {
		min-height: 44px;
		padding: 10px 0;
		font-size: 13px;
		font-weight: 650;
		line-height: 1.8;
		color: var(--teal);
		cursor: pointer;
	}
	.disclosure-content {
		padding-bottom: 6px;
		font-size: 13px;
		line-height: 1.9;
		color: var(--muted);
		overflow-wrap: anywhere;
	}
	.disclosure-content :global(p) {
		margin: 8px 0 0;
		font-size: inherit;
		line-height: inherit;
	}
	.disclosure-content :global(a) {
		display: inline-block;
		min-height: 44px;
		padding-block: 8px;
	}
</style>
