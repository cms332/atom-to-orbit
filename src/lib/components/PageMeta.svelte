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
	/></svelte:head
>
