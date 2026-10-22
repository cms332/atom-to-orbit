<script lang="ts">
	import ScaleExplorer from '$lib/components/ScaleExplorer.svelte';
	import ScaleGlyph from '$lib/components/ScaleGlyph.svelte';
	import { scaleArt } from '$lib/data/scale-art';
	import { objects } from '$lib/data/science';
	import { objectLength } from '$lib/utils/scales';
	import MoonDistance from '$lib/components/MoonDistance.svelte';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import { articles } from '$lib/content/articles';
	const topics = [
		{
			question: 'DNA는 얼마나 가늘까?',
			description: '세포와 머리카락까지, 눈에 보이지 않는 크기를 비교해 보세요.',
			id: 'dna'
		},
		{
			question: '탁구공에서 고래까지, 얼마나 커질까?',
			description: '손에 잡히는 사물에서 생물과 건축물로 시야를 넓혀 보세요.',
			id: 'ball'
		},
		{
			question: '지구는 태양보다 얼마나 작을까?',
			description: '달·행성·태양의 지름을 같은 축척으로 비교해 보세요.',
			id: 'earth'
		}
	].map((topic) => ({ ...topic, object: objects.find((object) => object.id === topic.id)! }));
</script>

<svelte:head
	><title>A2O — Atom to Orbit | 눈금으로 이해하는 세상의 크기</title><meta
		name="description"
		content="원자에서 궤도까지. 정확한 로그 눈금과 출처가 있는 시각적 비교로 세상의 크기를 이해하는 독립 과학 아카이브."
	/><meta property="og:title" content="A2O — 모든 크기에는 이야기가 있다." /><meta
		property="og:description"
		content="원자에서 궤도까지, 눈금으로 이해하는 세상의 크기."
	/></svelte:head
>
<section class="hero wrap">
	<div class="hero-copy">
		<h1>모든 크기에는<br />이야기가 있다.</h1>
		<p>
			눈에 보이지 않는 원자부터 거대한 천체까지. 숫자와 시각적 비교로 이해하는 독립 과학 아카이브.
		</p>
		<div class="hero-actions">
			<a href="/scale/" class="primary">크기 탐험하기 <span aria-hidden="true">↗</span></a><a
				href="/orbit/"
				class="text-link">궤도 탐험하기 ↗</a
			><a href="/articles/" class="text-link">과학 이야기 읽기 →</a>
		</div>
	</div>
	<ScaleExplorer compact />
</section>
<section class="wrap topics-section" aria-labelledby="explore-start-title">
	<div class="section-heading">
		<div>
			<h2 id="explore-start-title">어디에서 시작할까요?</h2>
		</div>
		<p>대상을 고르면 해당 크기에서 탐험을 시작합니다.</p>
	</div>
	<div class="topic-grid">
		{#each topics as topic (topic.id)}<article class="topic">
				<a
					href={`/scale/?object=${topic.id}`}
					class="topic-main"
					aria-labelledby={`topic-title-${topic.id}`}
					aria-describedby={`topic-description-${topic.id} topic-range-${topic.id}`}
					><div class="topic-art" aria-hidden="true">
						<svg
							fill={scaleArt[topic.id].color}
							viewBox={`-20 -20 ${scaleArt[topic.id].width + 40} ${scaleArt[topic.id].height + 40}`}
							><ScaleGlyph id={topic.id} /></svg
						>
					</div>
					<div class="topic-copy">
						<h3 id={`topic-title-${topic.id}`}>{topic.question}</h3>
						<p id={`topic-description-${topic.id}`}>{topic.description}</p>
					</div>
					<small class="topic-range" id={`topic-range-${topic.id}`}
						><span
							>{topic.object.measurement}<strong
								>{topic.object.approximation === 'standard' ? '' : '약 '}{objectLength(
									topic.object
								)}</strong
							></span
						>
						<span aria-hidden="true">↗</span></small
					></a
				>
			</article>{/each}
	</div>
</section>
<section class="wrap featured">
	<div>
		<h2>지구에서 달까지,<br />얼마나 멀까?</h2>
		<p>
			평균 약 38만 4,400 km.<br />머릿속에 그리기 어려운 거리도<br />익숙한 크기와 비교하면 다르게
			보입니다.
		</p>
		<a class="text-link" href="/articles/earth-moon/"
			>지구와 달의 거리 살펴보기 <span aria-hidden="true">↗</span></a
		>
	</div>
	<MoonDistance />
</section>
<section class="stories-band">
	<div class="wrap">
		<div class="section-heading">
			<div>
				<h2>세상의 규모를<br />읽는 방법.</h2>
			</div>
			<a href="/articles/" class="text-link">모든 이야기 보기 ↗</a>
		</div>
		<div class="article-grid">
			{#each articles as article (article.slug)}<ArticleCard {article} />{/each}
		</div>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 0.93fr) minmax(0, 1.07fr);
		align-items: center;
		gap: 58px;
		padding-block: 78px;
		min-height: 700px;
	}
	.hero h1 {
		font-size: clamp(43px, 4.65vw, 67px);
		line-height: 1.2;
		font-weight: 800;
		margin: 0 0 24px;
	}
	.hero-copy > p {
		max-width: 30rem;
		font-size: 17px;
		margin: 0;
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 23px;
		margin-top: 34px;
	}
	.hero-actions a {
		white-space: nowrap;
	}
	.topics-section {
		padding-top: 48px;
		border-top: 1px solid var(--line);
	}
	.topics-section .section-heading {
		display: block;
	}
	.topics-section .section-heading h2 {
		margin-top: 0;
	}
	.topics-section .section-heading p {
		max-width: 620px;
		margin-top: 18px;
	}
	.topic-grid {
		display: grid;
		border-top: 1px solid var(--line);
	}
	.topic {
		border-bottom: 1px solid var(--line);
		min-width: 0;
	}
	.topic-main {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr) 190px;
		align-items: center;
		gap: 36px;
		padding-block: 24px;
		text-decoration: none;
	}
	.topic-art {
		height: 120px;
	}
	.topic-art svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.topic-range strong {
		display: block;
		margin-top: 7px;
		font: 500 18px var(--font-mono);
	}
	.topic-range {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		font: 12px/1.6 var(--font-mono);
		color: var(--teal);
	}
	.topic-range > span:last-child {
		font-size: 22px;
	}
	.topic h3 {
		font-size: 24px;
		margin: 0 0 10px;
	}
	.topic p {
		font-size: 16px;
		line-height: 1.8;
		margin: 0;
	}
	.topic a:focus-visible h3 {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	@media (hover: hover) and (pointer: fine) {
		.topic a:hover h3 {
			text-decoration: underline;
			text-underline-offset: 5px;
		}
	}
	.featured {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		gap: 80px;
		align-items: center;
		padding-block: 112px;
	}
	.featured h2 {
		font-size: clamp(32px, 3.3vw, 48px);
		line-height: 1.35;
		margin: 17px 0 22px;
	}
	.featured p {
		font-size: 16px;
	}
	.stories-band {
		padding-block: 81px 90px;
		background: #f0f3ef;
		border-block: 1px solid #dce5df;
	}
	.article-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 38px;
	}
	@media (max-width: 1100px) {
		.article-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.hero {
			gap: 32px;
			padding-block: 60px;
		}
		.hero h1 {
			font-size: clamp(37px, 4.6vw, 52px);
		}
		.hero-actions {
			gap: 15px;
			flex-wrap: wrap;
		}
		.featured {
			gap: 38px;
		}
		.topic-main {
			grid-template-columns: 140px minmax(0, 1fr) 160px;
			gap: 24px;
		}
	}
	@media (max-width: 767px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 54px 62px;
			gap: 30px;
			min-height: 0;
		}
		.hero h1 {
			font-size: clamp(32px, 8.4vw, 46px);
			margin: 0 0 24px;
		}
		.hero-copy > p {
			font-size: 16px;
		}
		.hero-actions {
			flex-wrap: wrap;
			gap: 18px;
			margin-top: 28px;
		}
		.hero-actions .primary {
			padding-inline: 18px;
			gap: 18px;
			font-size: 14px;
		}
		.hero-actions .text-link {
			font-size: 14px;
		}
		.topics-section {
			padding-top: 36px;
		}
		.topic-main {
			grid-template-columns: 88px minmax(0, 1fr);
			gap: 12px 18px;
			padding-block: 24px;
		}
		.topic-art {
			grid-row: span 2;
			height: 100px;
		}
		.topic p {
			font-size: 14px;
		}
		.topic h3 {
			font-size: 22px;
		}
		.topic-range {
			grid-column: 2;
			font-size: 11px;
		}
		.featured {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 74px;
			gap: 28px;
		}
		.featured h2 {
			font-size: 35px;
		}
		.stories-band {
			padding-block: 65px;
		}
		.article-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 35px;
		}
	}
</style>
