<script lang="ts">
	import { onMount } from 'svelte';
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	import { MODEL_BOHR_DISTANCE, MODEL_NUCLEUS_DIAMETER } from '$lib/data/atomic-space';
	import { modelLengthLabel, scaleViewSpan } from '$lib/utils/atomic-space';
	let ready = $state(false);
	let zoom = $state(0);
	let width = $state(640);
	let stage: HTMLDivElement;
	// CSS centimetres follow 96px/in, independently of the device's physical pixel size.
	const closeUpDiameter = 96 / 2.54;
	const left = $derived(Math.max(28, width * 0.2));
	const right = $derived(width - 28);
	const closeUpSpan = $derived(((right - left) * MODEL_NUCLEUS_DIAMETER) / closeUpDiameter);
	const span = $derived(scaleViewSpan(zoom, closeUpSpan));
	const pixelsPerMeter = $derived((right - left) / span);
	const nucleusRadius = $derived((MODEL_NUCLEUS_DIAMETER / 2) * pixelsPerMeter);
	const nucleusVisible = $derived(nucleusRadius >= 1);
	const closeUpComplete = $derived(nucleusVisible && zoom === 1);
	const distanceX = $derived(left + MODEL_BOHR_DISTANCE * pixelsPerMeter);
	const targetVisible = $derived(MODEL_BOHR_DISTANCE <= span);
	onMount(() => {
		ready = true;
		const observer = new ResizeObserver(([entry]) => {
			width = entry.contentRect.width;
		});
		observer.observe(stage);
		return () => observer.disconnect();
	});
</script>

<figure class="atomic-distance" aria-labelledby="atomic-distance-title">
	<p class="eyebrow">핵을 1cm 구슬로 키운 수소 원자 모형</p>
	<h3 id="atomic-distance-title">한눈에 보는 크기 비교</h3>
	<table class="distance-facts">
		<caption>핵의 크기와 거리를 같은 비율로 키웠어요.</caption>
		<tbody>
			<tr><th scope="row">원자핵의 기준 크기</th><td><strong>1<span>cm</span></strong></td></tr>
			<tr
				><th scope="row">핵에서 전자의 대표 거리</th><td><strong>약 315<span>m</span></strong></td
				></tr
			>
			<tr
				><th scope="row">핵을 중심으로 양쪽에 펼친 길이</th><td
					><strong>약 630<span>m</span></strong></td
				></tr
			>
		</tbody>
	</table>
	<div class="stage" bind:this={stage}>
		<svg
			viewBox={`0 0 ${width} 300`}
			role="img"
			aria-labelledby="atomic-ruler-title atomic-ruler-desc"
		>
			<title id="atomic-ruler-title"
				>핵을 1cm로 키웠을 때 약 315m가 얼마나 먼지 보여 주는 그림</title
			>
			<desc id="atomic-ruler-desc"
				>현재 화면은 핵 중심부터 {modelLengthLabel(span)}까지입니다. 핵의 기준 길이는 1cm입니다. 약
				315m 표시는 전자의 고정 위치나 원자의 경계가 아닙니다.</desc
			>
			<path d={`M${left} 132H${right} M${left} 218H${right}`} stroke="#55777c" fill="none" />
			{#each [0, 0.25, 0.5, 0.75, 1] as fraction (fraction)}
				{@const x = left + (right - left) * fraction}
				<path d={`M${x} 212v12`} stroke="#91b0b3" />
				{#if fraction === 0 || fraction === 1 || width > 430}
					<text
						{x}
						y="247"
						text-anchor={fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}
						>{fraction === 0 ? '0' : modelLengthLabel(span * fraction)}</text
					>
				{/if}
			{/each}
			{#if nucleusVisible}
				<circle class="nucleus" cx={left} cy="132" r={nucleusRadius} fill="#db9a68" />
			{:else}
				<path
					class="nucleus-marker"
					d={`M${left - 5} 132h10 M${left} 127v10`}
					stroke="#efba8e"
					stroke-width="2"
				/>
			{/if}
			<text
				x={left}
				y={nucleusVisible ? Math.min(75, 132 - nucleusRadius - 16) : 190}
				text-anchor="middle"
				>{closeUpComplete ? '핵 · 지름 1cm' : nucleusVisible ? '핵' : '핵 위치'}</text
			>
			{#if targetVisible}
				<path d={`M${distanceX} 94V218`} stroke="#91d4dc" stroke-dasharray="3 5" />
				<text class="distance-label" x={distanceX} y="74" text-anchor="end">약 315m</text>
				<text x={distanceX} y="275" text-anchor="end">전자가 자주 발견되는 거리</text>
			{:else}
				<path d={`M${right - 32} 132h32l-8 -6m8 6l-8 6`} stroke="#91d4dc" fill="none" />
				<text x={right} y="92" text-anchor="end">315m 지점은 화면 밖</text>
			{/if}
		</svg>
	</div>
	<p class="scale-status" aria-live="polite">
		{#if !nucleusVisible}
			핵이 너무 작아 보이지 않아요. 십자 표시가 핵이 있는 곳이에요.
		{:else if closeUpComplete}
			핵을 1cm 구슬 모형으로 그렸어요. 거리도 같은 비율이에요.
		{:else}
			확대해 보니 핵이 서서히 눈에 보이기 시작하네요.
		{/if}
	</p>
	<div class="controls">
		<div class="presets" aria-label="거리 보기 선택">
			<button disabled={!ready} aria-pressed={zoom === 1} onclick={() => (zoom = 1)}
				>핵 가까이</button
			>
			<button disabled={!ready} aria-pressed={zoom === 0} onclick={() => (zoom = 0)}
				>315m까지 보기</button
			>
		</div>
		<label for="atomic-distance-zoom"
			><span>거리 확대</span><span>{modelLengthLabel(span)} 범위</span></label
		>
		<input
			id="atomic-distance-zoom"
			type="range"
			min="0"
			max="1"
			step="0.001"
			bind:value={zoom}
			disabled={!ready}
			aria-valuetext={`핵 중심부터 ${modelLengthLabel(span)}까지`}
		/>
		<div class="range-ends"><span>넓게 보기</span><span>가까이 보기</span></div>
	</div>
	<figcaption>
		<p>
			315m는 전자가 머무는 정해진 자리가 아니에요. 핵과 원자에는 구슬처럼 뚜렷한 테두리가 없고,
			315m도 원자의 끝을 뜻하지 않아요.
		</p>
		<ArticleDisclosure class="model-notes" label="모형 설명">
			<p>
				양성자 전하 RMS 반지름 rₚ의 두 배를 1cm로 놓았습니다. 확대 비율은 0.01m ÷ (2rₚ), 표시 거리는
				a₀ × 확대 비율 ≈ 314.7m입니다. 그림의 가로 눈금은 선형이고, 슬라이더는 큰 규모 차이를
				탐색하기 위해 확대율을 로그 간격으로 바꿉니다. 핵의 원형 표시는 기준 길이를 나타내며 실제
				표면이 아닙니다.
			</p>
			<p>
				끝까지 확대하면 핵의 지름을 브라우저의 1cm 기준에 맞춥니다. 기기나 브라우저 배율에 따라 실제
				자로 잰 길이는 다를 수 있습니다.
			</p>
			<a href="#source-atom-space-constants">[1] 길이와 상수의 출처 ↗</a>
		</ArticleDisclosure>
		<noscript
			><p class="fallback">
				JavaScript를 켜면 핵 가까이 확대할 수 있습니다. 위 도해와 거리 비교는 그대로 읽을 수
				있습니다.
			</p></noscript
		>
	</figcaption>
</figure>

<style>
	.atomic-distance {
		margin: 32px 0 40px;
		padding: 28px;
		border-radius: 10px;
		background: var(--deep);
		color: #edf3f1;
	}
	.eyebrow {
		color: #a9c6c9;
		font-size: 12px;
		margin: 0 0 10px;
	}
	h3 {
		font-size: 24px;
		margin: 0 0 25px;
	}
	.distance-facts {
		width: 100%;
		border-collapse: collapse;
		margin: 0;
		background: transparent;
	}
	.distance-facts caption {
		text-align: left;
		color: #c1d3d4;
		font-size: 13px;
		line-height: 1.8;
		padding-bottom: 8px;
	}
	.distance-facts th {
		text-align: left;
		font-weight: 500;
		color: #c1d3d4;
		width: 55%;
		font-size: 13px;
		line-height: 1.8;
		padding: 12px 14px 12px 0;
		border: 0;
		background: transparent;
	}
	.distance-facts td {
		padding: 12px 0;
		border: 0;
	}
	.distance-facts strong {
		display: block;
		font: 500 clamp(24px, 4vw, 32px) var(--font-mono);
		color: #efba8e;
		white-space: nowrap;
	}
	.distance-facts strong span {
		margin-left: 5px;
		font-size: 17px;
	}
	.stage {
		width: 100%;
		margin-top: 14px;
	}
	svg {
		display: block;
		width: 100%;
		height: 300px;
		overflow: hidden;
	}
	svg text {
		fill: #c1d3d4;
		font: 12px var(--font-sans);
	}
	svg .distance-label {
		font: 500 24px var(--font-mono);
		fill: #a7e3e9;
	}
	.scale-status {
		margin: 0 0 20px;
		font-size: 12px;
		color: #c1d3d4;
		min-height: 3.5em;
		line-height: 1.75;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 24px;
	}
	button {
		min-height: 44px;
		background: transparent;
		border: 1px solid #6b9398;
		color: #e8f2f1;
		padding: 10px 14px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 13px;
	}
	button[aria-pressed='true'] {
		background: #28545c;
		border-color: #9dc6ca;
	}
	button:disabled {
		cursor: default;
		opacity: 0.6;
	}
	label {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 13px;
	}
	input {
		width: 100%;
		height: 44px;
		accent-color: #b6dade;
		margin: 4px 0 0;
	}
	.range-ends {
		display: flex;
		justify-content: space-between;
		color: #a9c6c9;
		font-size: 11px;
	}
	figcaption {
		margin-top: 24px;
		font-size: 13px;
		color: #c1d3d4;
		line-height: 1.8;
	}
	figcaption p,
	.fallback {
		font-size: 13px;
		margin: 0;
		color: #c1d3d4;
	}
	figcaption :global(summary),
	figcaption :global(a) {
		color: #b4dfe3;
	}
	figcaption :global(.disclosure-content) {
		color: #c1d3d4;
	}
	@media (max-width: 600px) {
		.atomic-distance {
			padding: 22px 18px;
		}
		h3 {
			font-size: 22px;
		}
	}
</style>
