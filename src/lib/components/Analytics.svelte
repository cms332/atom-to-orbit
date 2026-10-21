<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { startAnalytics, trackPage } from '$lib/analytics';
	let lastPath = '';
	onMount(startAnalytics);
	afterNavigate(({ to }) => {
		const path = to?.url.pathname;
		if (path && path !== lastPath) {
			lastPath = path;
			trackPage(path);
		}
	});
</script>
