<script lang="ts">
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	let { inArticle = false }: { inArticle?: boolean } = $props();
	import { EARTH_MOON_METERS, objects } from '$lib/data/science';
	import {
		CENTER_DISTANCE_IN_EARTHS,
		SURFACE_GAP_IN_EARTHS,
		MODEL_FACTOR,
		MODEL_CENTER_DISTANCE,
		MODEL_MOON_DIAMETER,
		MOONLIGHT_SECONDS
	} from '$lib/data/earth-moon-comparison';
	import { lightSpeed } from '$lib/data/earth-moon-sources';
	const earth = objects.find((o) => o.id === 'earth')!;
	const moon = objects.find((o) => o.id === 'moon')!;
	const factor = 800 / EARTH_MOON_METERS;
</script>

<figure class="distance-figure" class:article={inArticle}>
	<div class="figure-top">
		<span>{inArticle ? '지구와 달' : 'EARTH ↔ MOON'}</span>
		<span>{inArticle ? '크기와 거리를 같은 비율로' : 'LINEAR SCALE / 1 : SAME'}</span>
	</div>
	<div class="distance-stat">
		{inArticle ? '약 ' : ''}{(EARTH_MOON_METERS / 1000).toLocaleString('en-US')}
		<span>km</span><small
			>{inArticle ? '한가운데에서 한가운데까지의 평균 거리' : '평균 중심 간 거리'}</small
		>
	</div>
	{#if inArticle}<div class="body-labels"><span>지구</span><span>달</span></div>{/if}
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
		{#if !inArticle}<g fill="#315E66" font-family="ui-monospace,monospace" font-size="18"
				><text x="50" y="40">EARTH</text><text x="850" y="40" text-anchor="end">MOON</text><text
					x="450"
					y="155"
					text-anchor="middle">≈ 30.2 × EARTH DIAMETER</text
				></g
			>{/if}
	</svg>
	<figcaption>
		{#if inArticle}
			<p class="distance-summary">지구 약 30개를 늘어놓은 길이예요.</p>
			<p class="drawing-note">
				크기와 거리를 똑같은 비율로 줄였어요. 그래서 달은 작은 점처럼 보여요. 거리는 두 천체의
				한가운데끼리 쟀어요.
			</p>
			<ArticleDisclosure class="model-notes" label="정확한 계산 살펴보기">
				<p>
					지구의 체적 평균 반지름 6,371km, 달의 체적 평균 반지름 1,737.4km를 각각 두 배 하면 지름은
					{(earth.meters / 1000).toLocaleString('en-US')}km와 {(moon.meters / 1000).toLocaleString(
						'en-US'
					)}km입니다. 체적 평균 지름은 같은 부피의 구로 바꾸었을 때의 지름입니다.
				</p>
				<p>
					중심 사이: 384,400 ÷ 12,742 ≈ {CENTER_DISTANCE_IN_EARTHS.toFixed(1)}배. 표면 사이:
					(384,400 − 6,371 − 1,737.4) ÷ 12,742 ≈ {SURFACE_GAP_IN_EARTHS.toFixed(1)}배. ‘약 30개’는
					두 길이를 쉽게 어림한 표현이며 정확히 30개가 표면 사이에 들어간다는 뜻은 아닙니다.
				</p>
				<p>
					공 모형은 지구 지름을 24cm = 0.24m로 정하고, 축소 비율 0.24 ÷ {earth.meters.toLocaleString(
						'en-US'
					)} ≈ {MODEL_FACTOR.toExponential(5)}를 크기와 거리에 모두 적용합니다. 달 지름은 약 {(
						MODEL_MOON_DIAMETER * 100
					).toFixed(2)}cm(표시 약 6.5cm), 중심 간 거리는 약 {MODEL_CENTER_DISTANCE.toFixed(3)}m(표시
					약 7.2m)입니다. 두 공 그림의 간격은 설명용이며, 정답 아래 거리 그림은 실제 비례입니다.
				</p>
				<p>
					빛의 진공 속도 c = {lightSpeed.metersPerSecond.toLocaleString('en-US')}m/s. 대표 거리로
					계산한 편도 시간은 {EARTH_MOON_METERS.toLocaleString('en-US')} ÷ c ≈ {MOONLIGHT_SECONDS.toFixed(
						3
					)}초, 본문에서는 약 1.3초입니다. 표면 위치와 실제 거리에 따른 차이를 생략한 근삿값이며
					태양에서 달까지의 시간은 포함하지 않습니다. NASA의 384,400km는 평균 거리를 설명하는
					대표값이며, Moon Fact Sheet의 궤도 긴반지름과 같은 값입니다.
				</p>
				<a href="#source-earth">NASA · Earth Fact Sheet ↗</a><br />
				<a href="#source-moon">NASA · Moon Fact Sheet ↗</a>
				<a href="#source-moon-jpl-model">NASA/JPL · 공 모형 활동 ↗</a>
				<a href="#source-moon-webb-light">NASA · 달빛의 이동 시간 ↗</a>
				<a href="#source-moon-light-speed">NIST · 빛의 속도 ↗</a>
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
		margin: 28px 0 40px;
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
	.body-labels {
		display: flex;
		justify-content: space-between;
		padding-inline: 5.55%;
		margin-top: 24px;
		font-size: 14px;
		color: var(--ink);
	}
	.article figcaption .distance-summary {
		margin: 0 0 12px;
		font-size: 18px;
		font-weight: 650;
		color: var(--ink);
	}
	.article figcaption .drawing-note {
		margin: 0 0 12px;
		font-size: 13px;
		line-height: 1.9;
		color: var(--muted);
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
