<script lang="ts">
	import { onMount } from 'svelte';
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	import { BOHR_RADIUS, MODEL_BOHR_DISTANCE } from '$lib/data/atomic-space';
	import { radialDensity, shellProbability, spatialDensity } from '$lib/utils/atomic-space';
	let ready = $state(false);
	let radius = $state(1);
	const lower = $derived(Math.max(0, radius - 0.1));
	const upper = $derived(radius + 0.1);
	const probability = $derived(shellProbability(radius) * 100);
	const metres = (x: number) => Math.round(x * MODEL_BOHR_DISTANCE).toLocaleString('ko-KR');
	const plotX = (x: number) => 40 + (250 * x) / 6;
	const plotY = (x: number) => 225 - (radialDensity(x) / radialDensity(1)) * 180;
	const points = Array.from({ length: 241 }, (_, i) => i / 40);
	const curve = points.map((x, i) => `${i ? 'L' : 'M'}${plotX(x)},${plotY(x)}`).join(' ');
	const area = $derived(
		`M${plotX(lower)},225 ` +
			Array.from({ length: 31 }, (_, i) => lower + ((upper - lower) * i) / 30)
				.map((x) => `L${plotX(x)},${plotY(x)}`)
				.join(' ') +
			` L${plotX(upper)},225Z`
	);
	onMount(() => {
		ready = true;
	});
</script>

<figure class="atomic-probability" aria-labelledby="atomic-probability-title">
	<h3 id="atomic-probability-title">같은 전자구름, 두 가지 모습</h3>
	<p class="intro">작은 공간을 볼 때와, 같은 거리의 둥근 공간을 모아 볼 때를 비교해요.</p>
	<div class="plots">
		<div class="plot">
			<h4>어느 곳에서 더 자주 발견될까?</h4>
			<p>같은 크기의 작은 공간끼리 비교해요.</p>
			<svg
				viewBox="0 0 320 280"
				role="img"
				aria-labelledby="electron-cloud-title electron-cloud-desc"
			>
				<title id="electron-cloud-title">전자가 발견될 가능성을 구름처럼 나타낸 그림</title>
				<desc id="electron-cloud-desc"
					>핵 가까이에서 전자를 더 자주 찾을 수 있습니다. 테두리는 구슬 모형에서 핵으로부터 약 {metres(
						radius
					)}m 떨어진 둥근 공간을 표시합니다. 전자가 도는 길은 아닙니다.</desc
				>
				<defs
					><radialGradient id="hydrogen-density-gradient">
						{#each Array.from({ length: 61 }, (_, i) => i / 60) as fraction (fraction)}
							<stop
								offset={fraction}
								stop-color="#286875"
								stop-opacity={spatialDensity(6 * fraction)}
							/>
						{/each}
					</radialGradient></defs
				>
				<path d="M10 139H310 M160 10V268" stroke="#b9cdcf" stroke-dasharray="2 5" />
				<circle cx="160" cy="139" r="132" fill="url(#hydrogen-density-gradient)" />
				<circle
					cx="160"
					cy="139"
					r={(lower + upper) * 11}
					fill="none"
					stroke="#b06d38"
					stroke-opacity="0.25"
					stroke-width={(upper - lower) * 22}
				/>
				<circle
					cx="160"
					cy="139"
					r={radius * 22}
					fill="none"
					stroke="#9a592d"
					stroke-dasharray="3 4"
				/>
				<circle cx="160" cy="139" r="3" fill="#9a592d" />
				<text x="160" y="274" text-anchor="middle">전자구름을 가운데서 자른 그림</text>
			</svg>
			<p class="plot-note">밝을수록 더 자주 발견돼요. 핵은 크게 표시했어요.</p>
		</div>
		<div class="plot">
			<h4>얼마나 떨어진 곳에서 발견될까?</h4>
			<p>핵을 둘러싼 같은 두께의 둥근 공간끼리 비교해요.</p>
			<svg
				viewBox="0 0 320 280"
				role="img"
				aria-labelledby="radial-probability-title radial-probability-desc"
			>
				<title id="radial-probability-title"
					>핵에서 얼마나 떨어진 곳에서 전자를 자주 찾을 수 있는지 보여 주는 그래프</title
				>
				<desc id="radial-probability-desc"
					>거리는 핵을 1cm 구슬로 키운 모형의 미터 단위입니다. 봉우리가 높을수록 그 거리 부근에서 더
					자주 발견됩니다. 약 315m에서 가장 높습니다. 선택한 갈색 띠 안에서 발견될 가능성은 약 {probability.toFixed(
						1
					)}%입니다.</desc
				>
				{#each [0, 0.5, 1] as y (y)}
					<path d={`M40 ${225 - y * 180}H290`} stroke="#bfced0" stroke-dasharray="3 5" />
					{#if y !== 0.5}<text x="30" y={230 - y * 180} text-anchor="end"
							>{y === 1 ? '높음' : '낮음'}</text
						>{/if}
				{/each}
				<text x="40" y="22">발견 가능성</text>
				<path d="M40 40V225H294" fill="none" stroke="#6b8b91" />
				<path d={area} fill="#b87d43" opacity="0.3" />
				<path d={curve} fill="none" stroke="#286875" stroke-width="2.5" />
				<path d={`M${plotX(1)} 44V225`} stroke="#6b8b91" stroke-dasharray="3 5" />
				<text x={plotX(1) + 7} y="38">약 315m에서 가장 높아요</text>
				<path d={`M${plotX(radius)} ${plotY(radius)}V225`} stroke="#9a592d" />
				<circle cx={plotX(radius)} cy={plotY(radius)} r="4" fill="#9a592d" />
				{#each [0, 300, 600, 1200, 1800] as m (m)}
					<text x={plotX(m / MODEL_BOHR_DISTANCE)} y="247" text-anchor="middle">{m}</text>
				{/each}
				<text x="290" y="274" text-anchor="end">구슬 모형의 거리 (m)</text>
			</svg>
			<p class="plot-note">봉우리가 높을수록 그 거리 부근에서 더 자주 발견돼요.</p>
		</div>
	</div>
	<div class="radius-control">
		<label for="atomic-probability-radius"
			><span>살펴볼 거리</span><output>약 {metres(radius)}m</output></label
		>
		<input
			id="atomic-probability-radius"
			type="range"
			min="0"
			max="5"
			step="0.05"
			bind:value={radius}
			disabled={!ready}
			aria-valuetext={`1cm 구슬 모형에서 핵으로부터 약 ${metres(radius)}미터`}
		/>
		<div class="range-ends"><span>핵 중심 · 0m</span><span>약 {metres(5)}m</span></div>
		<p class="measurement">거리는 모두 핵을 1cm 구슬로 키웠을 때의 거리예요.</p>
		<p class="probability-result" aria-live="polite">
			갈색 띠 안에서 발견될 가능성
			<strong>약 {probability.toFixed(1)}%</strong>
			<span class="selected-range">선택한 거리: 약 {metres(lower)}~{metres(upper)}m</span>
		</p>
	</div>
	<figcaption>
		<p>
			이 그림은 가장 낮은 에너지를 가진 수소 원자를 설명해요. 전자구름은 전자를 찾을 가능성을 그린
			지도예요. 테두리는 전자가 도는 길이 아니며, 실제 움직임을 촬영한 것도 아니에요.
		</p>
		<ArticleDisclosure class="model-notes" label="모형 설명">
			<p>
				현재 선택한 실제 거리는 약 {(radius * BOHR_RADIUS * 1e12).toFixed(1)}pm입니다. 일반 화면에는
				1cm 핵 모형의 m 단위만 표시합니다. 그래프의 세로 높이는 거리별 확률밀도를 최댓값으로 나눈
				상대값이며, 같은 두께의 구간을 비교합니다. 가로축은 같은 모형의 선형 m 눈금입니다.
			</p>
			<p>
				수소 1s · 고정된 핵 · 비상대론적 모형입니다. x=r/a₀일 때 공간 확률밀도의 중심 대비 비는
				exp(−2x), 단위 x당 거리별 확률밀도는 p(x)=4x²exp(−2x)입니다. 구껍질 부피의 4πr² 요소 때문에
				두 분포의 최댓값 위치가 다릅니다.
			</p>
			<p>
				단면의 밝기는 중심 대비 공간 확률밀도에 대응하며, 3차원 구름을 평면에 투영한 그림이
				아닙니다. 표시 범위 밖에도 확률이 이어집니다. 구간 확률은 F(x)=1−exp(−2x)(1+2x+2x²)를 두
				끝점에서 빼서 구합니다. 선택 폭은 ±0.10a₀이며 핵 중심에서는 0 아래를 제외합니다.
			</p>
			<a href="#source-atom-space-hydrogen">[2] 파동함수와 확률 분포의 출처 ↗</a>
		</ArticleDisclosure>
		<noscript
			><p class="fallback">
				JavaScript 없이도 약 315m 부근의 기본 비교를 읽을 수 있습니다. 거리 선택은 JavaScript를 켜면
				사용할 수 있습니다.
			</p></noscript
		>
	</figcaption>
</figure>

<style>
	.atomic-probability {
		margin: 32px 0 40px;
		padding: 28px;
		border-radius: 10px;
		background: var(--soft-teal);
		color: var(--ink);
	}
	h3 {
		font-size: 23px;
		margin: 0 0 12px;
	}
	.intro {
		font-size: 14px;
		margin: 0 0 28px;
		color: var(--muted);
	}
	.plots {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
	}
	.plot {
		min-width: 0;
	}
	h4 {
		font-size: 16px;
		margin: 0 0 7px;
		line-height: 1.5;
		min-height: 3em;
	}
	.plot p {
		font-size: 12px;
		margin: 0;
		line-height: 1.8;
		color: var(--muted);
	}
	.plot > p:not(.plot-note) {
		min-height: 3.6em;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		margin-top: 12px;
	}
	svg text {
		fill: #3d6068;
		font: 12px var(--font-sans);
	}
	.plot .plot-note {
		font-size: 11px;
	}
	.radius-control {
		margin-top: 30px;
	}
	label {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 14px;
	}
	output {
		font-family: var(--font-mono);
		color: var(--teal);
	}
	input {
		width: 100%;
		height: 44px;
		margin: 4px 0 0;
		accent-color: var(--teal);
	}
	.range-ends {
		display: flex;
		justify-content: space-between;
		color: var(--muted);
		font-size: 11px;
	}
	.measurement {
		font-size: 13px;
		margin: 22px 0 10px;
	}
	.probability-result {
		font-size: 13px;
		min-height: 3.6em;
		line-height: 1.8;
		margin: 0;
	}
	.probability-result strong {
		white-space: nowrap;
	}
	.selected-range {
		display: block;
		margin-top: 6px;
		color: var(--muted);
	}
	figcaption {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 18px;
	}
	figcaption p,
	.fallback {
		margin: 0;
		font-size: 13px;
	}
	@media (max-width: 650px) {
		.plots {
			grid-template-columns: 1fr;
			gap: 30px;
		}
		h4,
		.plot > p:not(.plot-note) {
			min-height: 0;
		}
		.atomic-probability {
			padding: 22px 18px;
		}
		h3 {
			font-size: 22px;
		}
		svg {
			max-width: 360px;
			margin-inline: auto;
		}
	}
</style>
