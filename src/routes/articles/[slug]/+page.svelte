<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import MoonDistance from '$lib/components/MoonDistance.svelte';
	import MotionSpeeds from '$lib/components/MotionSpeeds.svelte';
	import TrainInertia from '$lib/components/TrainInertia.svelte';
	import MotionFrames from '$lib/components/MotionFrames.svelte';
	import AtomicSpaceScale from '$lib/components/AtomicSpaceScale.svelte';
	import AtomicProbability from '$lib/components/AtomicProbability.svelte';
	import ArticleDisclosure from '$lib/components/ArticleDisclosure.svelte';
	import AtomicReference from '$lib/components/AtomicReference.svelte';
	import AtomBallMoon from '$lib/components/AtomBallMoon.svelte';
	import LogScaleSteps from '$lib/components/LogScaleSteps.svelte';
	import EarthMoonBalls from '$lib/components/EarthMoonBalls.svelte';
	import LightTravelExplorer from '$lib/components/LightTravelExplorer.svelte';
	import StarlightQuiz from '$lib/components/StarlightQuiz.svelte';
	import SkyColorExplorer from '$lib/components/SkyColorExplorer.svelte';
	import SkyComparison from '$lib/components/SkyComparison.svelte';
	import SkyQuiz from '$lib/components/SkyQuiz.svelte';
	import { sourceById } from '$lib/data/science';
	import { articles } from '$lib/content/articles';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let article = $derived(data.article);
	function revealSourceReferences(node: HTMLElement) {
		const revealHash = (hash: string) => {
			if (!hash.startsWith('#source-')) return;
			const target = document.getElementById(hash.slice(1));
			if (!target || !node.contains(target)) return;
			for (
				let parent = target.parentElement;
				parent && parent !== node;
				parent = parent.parentElement
			) {
				if (parent instanceof HTMLDetailsElement) parent.open = true;
			}
		};
		const click = (event: MouseEvent) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				event.altKey
			)
				return;
			const link =
				event.target instanceof Element
					? event.target.closest<HTMLAnchorElement>('a[href^="#source-"]')
					: null;
			if (link) revealHash(link.hash);
		};
		const hashChange = () => revealHash(window.location.hash);
		queueMicrotask(hashChange);
		node.addEventListener('click', click);
		window.addEventListener('hashchange', hashChange);
		return {
			destroy() {
				node.removeEventListener('click', click);
				window.removeEventListener('hashchange', hashChange);
			}
		};
	}
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
	{#if article.date}<meta property="article:published_time" content={article.date} />{/if}
	<!-- Only typed editorial metadata is serialized; all less-than characters are JSON-escaped. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html schemaMarkup}
</svelte:head>
{#key article.slug}
	<article class="wrap page-content" use:revealSourceReferences>
		<header class="article-header reading">
			<a class="text-link" href="/articles/">← 과학 이야기</a>
			<p class="article-category">{article.category}</p>
			<h1>{article.title}</h1>
			<p class="intro">{article.intro}</p>
		</header>
		<div class="reading article-body">
			{#each article.opening ?? [] as paragraph (paragraph)}<p>{paragraph}</p>{/each}
			<p class="lead">{article.takeaway}</p>
			{#if article.diagram === 'motion'}<MotionSpeeds sourceIds={article.sourceIds} />{/if}
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
			{#each article.sections as section, i (section.title)}<section>
					<h2 id={`question-${i + 1}`}>{section.title}</h2>
					<p>{section.text}</p>
					{#each section.paragraphs ?? [] as paragraph (paragraph)}<p>{paragraph}</p>{/each}
					{#if section.keyPoint}<p class="key-point">{section.keyPoint}</p>{/if}
					{#if section.aside}<aside>
							<h3>{section.aside.title}</h3>
							{#each section.aside.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
						</aside>{/if}
					{#if article.diagram === 'starlight' || article.diagram === 'sky-colors'}<div
							class="section-references"
							aria-label="이 내용의 근거"
						>
							{#each section.sourceIds ?? [] as id (id)}<a
									href={`#source-${id}`}
									aria-label={`출처 ${article.sourceIds.indexOf(id) + 1}: ${sourceById(id).label}`}
									>[{article.sourceIds.indexOf(id) + 1}]</a
								>{/each}
						</div>{/if}
					{#if section.visual === 'light-travel'}<LightTravelExplorer />{/if}
					{#if section.visual === 'sky-colors'}<SkyColorExplorer />{/if}
					{#if section.visual === 'sky-comparison'}<SkyComparison />{/if}
					{#if section.visual === 'inertia'}<TrainInertia
						/>{:else if section.visual === 'frames'}<MotionFrames
						/>{:else if section.visual === 'atomic-distance'}<AtomicSpaceScale
						/>{:else if section.visual === 'atomic-probability'}<AtomicProbability
						/>{:else if section.visual === 'atomic-reference'}<AtomicReference
						/>{:else if section.visual === 'atom-ball-moon'}<AtomBallMoon
						/>{:else if section.visual === 'log-steps'}<LogScaleSteps
						/>{:else if section.visual === 'earth-moon-distance'}<MoonDistance
							inArticle
						/>{:else if section.visual === 'earth-moon-balls'}<EarthMoonBalls />{/if}
				</section>{/each}
			{#if article.closing}<section class="article-closing">
					<h2>{article.closing.title}</h2>
					{#each article.closing.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
					{#if article.closing.keyPoint}<p class="key-point">{article.closing.keyPoint}</p>{/if}
				</section>{/if}
			{#if article.diagram === 'starlight'}<StarlightQuiz />{/if}
			{#if article.diagram === 'sky-colors'}
				<p class="note">
					관찰할 때는 태양 자체를 보지 말고 주변 하늘과 구름을 살펴보세요. 해 질 무렵에도 태양을
					직접 바라보지 않습니다. <a
						href="#source-sky-safety"
						aria-label="태양 관찰 주의사항의 출처">[5]</a
					>
				</p>
				<ArticleDisclosure label="왜 보라색 하늘은 아닐까요?">
					<p>
						보랏빛은 파란빛보다 파장이 짧아 더 잘 흩어집니다. 하지만 하늘색은 산란만으로 정해지지
						않아요. 햇빛에 들어 있는 색의 양과 우리 눈이 색을 느끼는 방식도 함께 영향을 줍니다. 그
						결과 보통 파란색으로 보입니다. <a href="#source-sky-metoffice">설명의 근거 ↗</a>
					</p>
				</ArticleDisclosure>
				<SkyQuiz />
			{/if}
			<aside class="explorer-invitation">
				<h2>직접 탐험해 보세요.</h2>
				{#if article.diagram === 'sky-colors'}
					<p>
						지구의 공기를 만나기 전, 빛은 얼마나 긴 여행을 했을까요? 달빛부터 멀리 있는 은하의
						빛까지 따라가 보세요.
					</p>
					<a href="/articles/how-old-is-starlight/#question-3" class="primary"
						>별빛의 여행 이어보기 ↗</a
					>
				{:else if article.diagram === 'starlight'}
					<p>달빛이 건너온 길은 얼마나 멀까요? 지구와 달을 같은 눈금 위에 놓고 비교해 보세요.</p>
					<a href="/scale/?object=earth" class="primary">크기 탐험으로 ↗</a>
				{:else if article.diagram === 'motion'}
					<p>
						태양과 여덟 행성의 움직임을 궤도 탐험기에서 이어 보세요. ‘태양계’와 ‘은하 궤적’을 오가며
						같은 운동의 다른 모습을 만날 수 있습니다.
					</p>
					<a href="/orbit/" class="primary">궤도 탐험에서 직접 보기 ↗</a>
				{:else}
					{#if article.diagram === 'atomic-space'}
						<p>
							원자부터 탁구공, 지구, 태양까지. 눈에 보이지 않는 작은 세계가 얼마나 놀라운 크기
							차이를 품고 있는지 크기 탐험기에서 직접 확인해 보세요.
						</p>
						<p>
							원자의 크기를 정하는 방법이 더 궁금하다면 <a href="/articles/atomic-scale/"
								>‘원자의 크기는 어떻게 읽을까?’</a
							>도 함께 읽어 보세요.
						</p>
					{:else}
						<p>
							{article.diagram === 'moon'
								? '지구와 달의 크기를 같은 눈금에서 비교해 보세요.'
								: '원자부터 머리카락, 탁구공, 지구, 태양까지 크기를 바꿔 보세요.'}
						</p>
					{/if}
					<a
						href={`/scale/?object=${article.diagram === 'moon' ? 'earth' : 'atom'}`}
						class="primary">크기 탐험으로 ↗</a
					>
				{/if}
			</aside>
			<section class="article-sources" aria-label="자료 및 출처">
				<ArticleDisclosure class="sources-disclosure" label="자료 및 출처">
					<p class="note">
						{article.sourceNote ?? '출처 수치를 사용한 환산과 비교는 A2O의 계산입니다.'}
					</p>
					{#if article.diagram === 'motion'}
						<p class="note">
							궤도 탐험기는 J2000부터 40년 범위의 근사 모형입니다. 기본 ‘시각적 강조’는 태양의 은하
							이동 성분을 1/20로 줄이며, 설정에서 ‘실제 속도 비율’로 바꿀 수 있습니다. 현재 시각의
							정밀한 관측 위치는 아닙니다.
						</p>
					{/if}
					<ol>
						{#each article.sourceIds as id (id)}{@const source = sourceById(id)}
							<li id={`source-${id}`} tabindex="-1">
								<a href={source.url}>{source.label} ↗</a>
								<p>{source.basis}</p>
								<small>확인일: {source.accessedAt}</small>
							</li>{/each}
					</ol>
				</ArticleDisclosure>
			</section>
			<div class="next">
				<h2>다음 이야기</h2>
				{#each articles.filter((a) => a.slug !== article.slug) as other (other.slug)}<a
						class="text-link"
						href={`/articles/${other.slug}/`}>{other.title} →</a
					>{/each}
			</div>
		</div>
	</article>
{/key}

<style>
	.section-references {
		display: flex;
		gap: 4px;
		margin-top: -8px;
	}
	.section-references a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		font-size: 12px;
		text-decoration: none;
	}
	.reading .key-point {
		color: var(--ink);
		font-weight: 650;
	}
	.article-sources li {
		scroll-margin-top: 30px;
	}
	.explorer-invitation {
		margin-top: 56px;
	}
	.explorer-invitation h2 {
		margin-top: 0;
	}
	.article-nav {
		margin-block: 36px 40px;
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
		margin-top: 32px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
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
		margin-top: 44px;
	}
	.next h2 {
		margin-top: 0;
	}
	.next > .text-link {
		display: block;
		width: fit-content;
		margin-top: 20px;
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
