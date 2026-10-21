<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { articles, articleTopics } from '$lib/content/articles';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	let topic = $derived(
		articleTopics.find(
			(item) => item.id === (mounted ? page.url.searchParams.get('topic') : null)
		) ?? articleTopics[0]
	);
	let filtered = $derived(
		articles.filter((article) => topic.id === 'all' || article.categoryId === topic.id)
	);
</script>

<PageMeta
	title="과학 이야기"
	description="하나의 질문에서 시작하는 짧고 정확한 과학 이야기. 원자의 기준 길이와 지구–달의 거리를 출처와 함께 읽습니다."
/>
<div class="wrap page-content">
	<div class="page-intro">
		<h1>과학 이야기</h1>
		<p>
			하나의 질문에서 시작하는 짧고 정확한 이야기.<br />숫자의 뜻을 짚고, 그림으로 관계를 읽습니다.
		</p>
	</div>
	<nav class="filters" aria-label="이야기 주제 필터">
		{#each articleTopics as item (item.id)}<a
				href={item.id === 'all' ? '/articles/' : `/articles/?topic=${item.id}`}
				aria-current={topic.id === item.id ? 'page' : undefined}
				data-sveltekit-keepfocus
				data-sveltekit-noscroll>{item.label}</a
			>{/each}
	</nav>
	<p class="filter-result" role="status" aria-live="polite" aria-atomic="true">
		{topic.label} 이야기 · {new Intl.NumberFormat('ko-KR').format(filtered.length)}편
	</p>
	<div class="articles">
		{#each filtered as article (article.slug)}<ArticleCard {article} headingLevel={2} />{/each}
	</div>
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
		margin-bottom: 18px;
	}
	.filters a {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: 5px;
		background: none;
		padding: 10px 18px;
		cursor: pointer;
		font-size: 14px;
		color: var(--muted);
	}
	.filters a[aria-current='page'] {
		background: var(--ink);
		border-color: var(--ink);
		color: white;
	}
	@media (hover: hover) and (pointer: fine) {
		.filters a:hover {
			border-color: var(--teal);
			background: var(--soft-teal);
			color: var(--ink);
		}
		.filters a[aria-current='page']:hover {
			background: var(--teal);
			color: white;
		}
	}
	.filter-result {
		font-size: 13px;
		margin: 0 0 28px;
		color: var(--muted);
	}
	.articles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 40px;
		max-width: 1000px;
	}
	@media (max-width: 767px) {
		.articles {
			grid-template-columns: 1fr;
		}
	}
</style>
