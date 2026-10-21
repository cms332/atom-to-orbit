<script lang="ts">
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	let { inArticle = false }: { inArticle?: boolean } = $props();
	import { EARTH_MOON_METERS, objects } from '$lib/data/science';
	const earth = objects.find((o) => o.id === 'earth')!;
	const moon = objects.find((o) => o.id === 'moon')!;
	const factor = 800 / EARTH_MOON_METERS;
</script>

<figure class="distance-figure" class:article={inArticle}>
	<div class="figure-top"><span>EARTH ↔ MOON</span><span>LINEAR SCALE / 1 : SAME</span></div>
	<div class="distance-stat">384,400 <span>km</span><small>평균 중심 간 거리</small></div>
	<svg
		viewBox="0 0 900 180"
		role="img"
		aria-label="같은 선형 축척으로 그린 지구와 달. 평균 중심 간 거리는 지구 지름의 약 30.2배입니다."
	>
		<path d="M50 80H850" stroke="#6D9498" stroke-dasharray="4 5" />
		<circle cx="50" cy="80" r={(earth.meters * factor) / 2} fill="#286875" /><circle
			cx="850"
			cy="80"
			r={(moon.meters * factor) / 2}
			fill="#987750"
		/>
		<path d="M50 104v16H850v-16" fill="none" stroke="#6D9498" />
		<g fill="#315E66" font-family="ui-monospace,monospace" font-size="18"
			><text x="50" y="40">EARTH</text><text x="850" y="40" text-anchor="end">MOON</text><text
				x="450"
				y="155"
				text-anchor="middle">≈ 30.2 × EARTH DIAMETER</text
			></g
		>
	</svg>
	<figcaption>
		{#if inArticle}
			<ArticleDisclosure class="model-notes" label="모형 설명">
				<p>지름과 거리는 같은 축척입니다. 작은 달의 점도 실제 비례입니다. 평균 지름 기준입니다.</p>
				<a href="#source-earth">NASA · Earth Fact Sheet ↗</a><br />
				<a href="#source-moon">NASA · Moon Fact Sheet ↗</a>
			</ArticleDisclosure>
		{:else}
			지름과 거리는 같은 축척입니다. 작은 달의 점도 실제 비례입니다.<br />자료: NASA Earth / Moon
			Fact Sheet · 평균 지름 기준
		{/if}
	</figcaption>
</figure>

<style>
	.distance-figure {
		margin: 0;
		padding: 26px;
		background: var(--soft-teal);
		border: 1px solid #d3e0dd;
		border-radius: 14px;
		overflow: hidden;
	}
	.distance-figure.article {
		border-radius: 12px;
	}
	.figure-top {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font:
			10px ui-monospace,
			monospace;
		color: #42636b;
	}
	.distance-stat {
		font:
			500 clamp(32px, 4vw, 47px) ui-monospace,
			monospace;
		margin: 35px 0 10px;
		color: var(--teal);
	}
	.distance-stat > span {
		font-size: 20px;
	}
	.distance-stat small {
		display: block;
		font: 12px var(--font-sans);
		color: var(--muted);
		margin-top: 8px;
	}
	svg {
		width: 100%;
		display: block;
		min-height: 105px;
	}
	figcaption {
		font-size: 11px;
		line-height: 1.8;
		color: #42636b;
		margin-top: 16px;
	}
	@media (max-width: 600px) {
		.distance-figure {
			padding: 20px;
		}
		.figure-top {
			font-size: 9px;
		}
		.distance-stat {
			margin-top: 30px;
		}
	}
</style>
