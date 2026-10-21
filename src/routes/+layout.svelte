<script lang="ts">
	import '$lib/styles.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';
	let { children } = $props();
</script>

<svelte:head
	><meta name="color-scheme" content="light" /><meta
		property="og:site_name"
		content="A2O — Atom to Orbit"
	/><meta property="og:locale" content="ko_KR" /><meta
		property="og:type"
		content={page.url.pathname.startsWith('/articles/') && page.params.slug ? 'article' : 'website'}
	/><meta property="og:image" content="https://a2o.kr/og-default.png" /><link
		rel="canonical"
		href={`https://a2o.kr${page.url.pathname}`}
	/></svelte:head
>
<Header />
<main id="main" tabindex="-1">{@render children()}</main>
<Footer />
