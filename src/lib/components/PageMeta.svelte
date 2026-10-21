<script lang="ts">
	let { title, description }: { title: string; description: string } = $props();
</script>

<svelte:head
	><title>{title} | A2O — Atom to Orbit</title><meta
		name="description"
		content={description}
	/><meta property="og:title" content={`${title} | A2O`} /><meta
		property="og:description"
		content={description}
	/><meta name="twitter:card" content="summary_large_image" /><meta
		name="twitter:title"
		content={`${title} | A2O`}
	/><meta name="twitter:description" content={description} /><meta
		name="twitter:image"
		content="https://a2o.kr/og-default.png"
	/></svelte:head
>
