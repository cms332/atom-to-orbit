<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import MoonDistance from '$lib/components/MoonDistance.svelte';
	import Diagram from '$lib/components/Diagram.svelte';
	import MotionSpeeds from '$lib/components/MotionSpeeds.svelte';
	import TrainInertia from '$lib/components/TrainInertia.svelte';
	import MotionFrames from '$lib/components/MotionFrames.svelte';
	import { sourceById } from '$lib/data/science';
	import { articles } from '$lib/content/articles';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let article = $derived(data.article);
	const structuredData = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: article.title,
			description: article.intro,
			datePublished: article.date,
			inLanguage: 'ko-KR',
			articleSection: article.category,
			mainEntityOfPage: `https://a2o.kr/articles/${article.slug}/`,
			author: { '@type': 'Organization', name: 'A2O', url: 'https://a2o.kr/' },
			publisher: { '@type': 'Organization', name: 'A2O — Atom to Orbit', url: 'https://a2o.kr/' }
		}).replace(/</g, '\\u003c')
	);
	const schemaMarkup = $derived(
		['<script type="application/ld+json">', structuredData, '</scr', 'ipt>'].join('')
	);
</script>

<PageMeta title={article.title} description={article.intro} />
<svelte:head>
	<meta property="article:published_time" content={article.date} />
	<!-- Only typed editorial metadata is serialized; all less-than characters are JSON-escaped. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html schemaMarkup}
</svelte:head>
<article class="wrap page-content">
	<header class="article-header reading">
		<a class="text-link" href="/articles/">← 과학 이야기</a>
		<p class="article-category">{article.category}</p>
		<h1>{article.title}</h1>
		<p class="intro">{article.intro}</p>
		{#if article.diagram === 'motion'}<p class="article-details">
				<time datetime={article.date}>{article.date.replaceAll('-', '.')}</time><span
					>약 {article.readingMinutes}분 읽기</span
				>
			</p>{/if}
	</header>
	<div class="reading">
		{#each article.opening ?? [] as paragraph (paragraph)}<p>{paragraph}</p>{/each}
		<p class="lead">{article.takeaway}</p>
		{#if article.diagram === 'motion'}<MotionSpeeds />{/if}
		<nav class="article-nav" aria-label="이 글의 순서">
			<span class="contents-label">이 글의 순서</span>
			<ol>
				{#each article.sections as section, i (section.title)}<li>
						<a href={`#question-${i + 1}`}
							><span aria-hidden="true">0{i + 1}</span>{section.title}</a
						>
					</li>{/each}
			</ol>
		</nav>
		{#if article.diagram === 'moon'}<MoonDistance />{:else if article.diagram === 'atom'}<figure
				class="atom-figure"
			>
				<div class="atom-art"><Diagram kind="atom" /></div>
				<strong>2a₀ ≈ 0.106 nm</strong>
				<figcaption>
					보어 반지름의 두 배를 기준 길이로 사용합니다.<br />상징적 도식 · 전자 궤도나 실제 크기
					비례를 나타내지 않습니다.<br />자료: NIST · 2022 CODATA
				</figcaption>
			</figure>{/if}{#each article.sections as section, i (section.title)}<section>
				<h2 id={`question-${i + 1}`}>{section.title}</h2>
				<p>{section.text}</p>
				{#each section.paragraphs ?? [] as paragraph (paragraph)}<p>{paragraph}</p>{/each}
				{#if section.keyPoint}<p class="key-point">{section.keyPoint}</p>{/if}
				{#if section.sourceIds}<p class="section-sources">
						자료:
						{#each section.sourceIds as id (id)}<a href={`#source-${id}`}
								>[{article.sourceIds.indexOf(id) + 1}] {sourceById(id).label}</a
							>{/each}
					</p>{/if}
				{#if section.visual === 'inertia'}<TrainInertia
					/>{:else if section.visual === 'frames'}<MotionFrames />{/if}
			</section>{/each}
		{#if article.diagram === 'motion'}
			<aside class="orbit-invitation">
				<h2>이제, 시선을 은하 속으로.</h2>
				<p>
					태양과 여덟 행성의 움직임을 궤도 탐험기에서 이어 보세요. ‘태양계’와 ‘은하 궤적’을 오가며
					같은 운동의 다른 모습을 만날 수 있습니다.
				</p>
				<a href="/orbit/" class="primary">궤도 탐험에서 직접 보기 ↗</a>
				<p class="model-note">
					J2000부터 40년 범위의 근사 모형입니다. 기본 ‘시각적 강조’는 태양의 은하 이동 성분을 1/20로
					줄이며, 설정에서 ‘실제 속도 비율’로 바꿀 수 있습니다. 현재 시각의 정밀한 관측 위치는
					아닙니다.
				</p>
			</aside>
		{/if}
		<section class="article-sources">
			<h2>자료 및 출처</h2>
			<p class="note">
				{article.sourceNote ?? '출처 수치를 사용한 환산과 비교는 A2O의 계산입니다.'}
			</p>
			<ol>
				{#each article.sourceIds as id (id)}{@const source = sourceById(id)}
					<li id={`source-${id}`}>
						<a href={source.url}>{source.label} ↗</a>
						<p>{source.basis}</p>
						<small>확인일: {source.accessedAt}</small>
					</li>{/each}
			</ol>
		</section>
		<div class="next">
			{#if article.diagram !== 'motion'}<h2>직접 눈금을 움직여 보세요.</h2>
				<a href={`/scale/?object=${article.diagram === 'moon' ? 'earth' : 'atom'}`} class="primary"
					>크기 탐험으로 ↗</a
				>{:else}<h2>
					다음 질문으로 이어 가세요.
				</h2>{/if}{#each articles.filter((a) => a.slug !== article.slug) as other (other.slug)}<a
					class="text-link"
					href={`/articles/${other.slug}/`}>다음 이야기: {other.title} →</a
				>{/each}
		</div>
	</div>
</article>

<style>
	.article-details {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		font-size: 13px;
		padding-bottom: 16px;
	}
	.reading .key-point {
		color: var(--ink);
		font-weight: 650;
	}
	.reading .section-sources {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 3px 12px;
		font-size: 12px;
		line-height: 1.8;
		margin-top: 16px;
	}
	.section-sources a {
		padding-block: 6px;
	}
	.article-sources li {
		scroll-margin-top: 30px;
	}
	.orbit-invitation {
		border-block: 1px solid var(--line);
		padding: 10px 0 26px;
		margin-top: 42px;
	}
	.reading .model-note {
		font-size: 13px;
		line-height: 1.9;
		margin-top: 20px;
	}
	.article-nav {
		border-block: 1px solid var(--line);
		padding-block: 22px;
		margin-bottom: 32px;
	}
	.article-header .article-category,
	.contents-label {
		font-size: 13px;
		font-weight: 650;
		color: var(--teal);
	}
	.article-nav ol {
		list-style: none;
		margin: 12px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 4px 24px;
	}
	.article-nav li {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
	}
	.article-nav a {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		text-decoration: none;
	}
	.article-nav a:focus-visible {
		text-decoration: underline;
	}
	@media (hover: hover) and (pointer: fine) {
		.article-nav a:hover {
			text-decoration: underline;
		}
	}
	.article-nav a span {
		font: 11px var(--font-mono);
		color: var(--muted);
	}
	h2[id] {
		scroll-margin-top: 30px;
	}
	@media (max-width: 600px) {
		.article-nav ol {
			grid-template-columns: 1fr;
		}
	}
	.article-header {
		padding-top: 38px;
		border-bottom: 1px solid var(--line);
	}
	.article-header .article-category {
		margin: 32px 0 0;
	}
	h1 {
		font-size: clamp(35px, 4.5vw, 58px);
		line-height: 1.3;
		margin: 20px 0 24px;
	}
	.intro {
		font-size: 19px;
	}
	.article-sources {
		border-top: 1px solid var(--line);
		margin-top: 50px;
	}
	.article-sources li {
		font-size: 15px;
		margin-block: 23px;
	}
	.article-sources li p {
		font-size: 14px;
		margin: 7px 0;
	}
	.article-sources small {
		font-size: 12px;
	}
	.reading .note {
		font-size: 13px;
	}
	.next {
		border-top: 1px solid var(--line);
		margin-top: 40px;
		padding-top: 36px;
	}
	.next h2 {
		margin-top: 12px;
	}
	.next > .text-link {
		display: block;
		width: fit-content;
		margin-top: 20px;
	}
	.atom-figure {
		margin: 0;
		padding: 24px;
		background: var(--soft-teal);
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.atom-art {
		height: 230px;
	}
	.atom-figure strong {
		display: block;
		font:
			500 29px ui-monospace,
			monospace;
		color: var(--teal);
	}
	figcaption {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.8;
		margin-top: 18px;
	}
	@media (max-width: 767px) {
		.intro {
			font-size: 17px;
		}
		.article-header {
			padding-top: 25px;
		}
	}
</style>
