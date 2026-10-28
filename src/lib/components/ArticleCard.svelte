<script lang="ts">
	import type { Article } from '$lib/content/articles';
	import Diagram from './Diagram.svelte';
	import MotionThumbnail from './MotionThumbnail.svelte';
	import AtomicSpaceThumbnail from './AtomicSpaceThumbnail.svelte';
	import StarlightThumbnail from './StarlightThumbnail.svelte';
	let { article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 } = $props();
</script>

<article class="article-card">
	<a
		href={`/articles/${article.slug}/`}
		aria-labelledby={`article-title-${article.slug}`}
		aria-describedby={`article-intro-${article.slug}`}
		><div class="article-art">
			{#if article.diagram === 'starlight'}<StarlightThumbnail
				/>{:else if article.diagram === 'atomic-space'}<AtomicSpaceThumbnail
				/>{:else if article.diagram === 'motion'}<MotionThumbnail
				/>{:else if article.diagram === 'atom'}<Diagram kind="atom" />{:else}<svg
					viewBox="0 0 440 200"
					role="img"
					aria-label="지구와 달의 거리 비교를 위한 상징적 도식. 실제 크기 비례가 아님."
					><path
						d="M85 100H355M85 148v15h270v-15"
						stroke="#89A6A6"
						fill="none"
						stroke-dasharray="4 5"
					/><circle cx="85" cy="100" r="40" fill="#397987" /><circle
						cx="355"
						cy="100"
						r="11"
						fill="#C29D72"
					/><text
						x="220"
						y="90"
						text-anchor="middle"
						fill="#315E66"
						font-size="16"
						font-family="monospace">384,400 km</text
					><text x="220" y="190" text-anchor="middle" fill="#586B74" font-size="11"
						>상징적 도식 · 실제 비례 아님</text
					></svg
				>{/if}
		</div>
		<div class="article-meta">{article.category}</div>
		<svelte:element
			this={headingLevel === 2 ? 'h2' : 'h3'}
			class="article-title"
			id={`article-title-${article.slug}`}>{article.title}</svelte:element
		>
		<p id={`article-intro-${article.slug}`}>{article.intro}</p>
	</a>
</article>

<style>
	.article-card {
		min-width: 0;
		border-top: 1px solid #afc5c3;
		padding-top: 16px;
	}
	.article-card a {
		display: block;
		text-decoration: none;
	}
	.article-art {
		height: 180px;
		background: var(--soft-teal);
		margin-bottom: 23px;
		border-radius: 7px;
	}
	.article-art :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}
	.article-meta {
		font-size: 11px;
		color: var(--teal);
		display: flex;
		justify-content: space-between;
	}
	.article-title {
		font-size: 23px;
		line-height: 1.5;
		margin: 14px 0 11px;
	}
	p {
		font-size: 16px;
		line-height: 1.85;
		color: var(--muted);
		margin: 0;
	}
	a:focus-visible .article-title {
		color: var(--teal);
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	@media (hover: hover) and (pointer: fine) {
		a:hover .article-title {
			color: var(--teal);
			text-decoration: underline;
			text-underline-offset: 5px;
		}
	}
	@media (max-width: 600px) {
		.article-art {
			height: 160px;
		}
		.article-title {
			font-size: 22px;
		}
	}
</style>
