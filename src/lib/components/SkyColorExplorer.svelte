<script lang="ts">
	import { onMount } from 'svelte';
	import { SKY_MODEL, sampleDirectBeam, skyExplanation } from '$lib/data/sky-colors';
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	import SkyLandscape from './SkyLandscape.svelte';
	import SkyRayDiagram from './SkyRayDiagram.svelte';
	const id = $props.id();
	let elevation = $state<number>(SKY_MODEL.defaultElevationDeg);
	let mounted = $state(false);
	let reduced = $state(false);
	let emphasis = $state('');
	let live = $state('');
	let root: HTMLElement;
	let timers: ReturnType<typeof setTimeout>[] = [];
	const sample = $derived(sampleDirectBeam(elevation));
	const explanation = $derived(skyExplanation(elevation));
	function stop() {
		timers.forEach(clearTimeout);
		timers = [];
		emphasis = '';
	}
	function setElevation(value: number, announce = true) {
		stop();
		elevation = value;
		if (announce) live = skyExplanation(value);
	}
	function highlight() {
		stop();
		if (reduced) {
			emphasis = 'all';
			live = '두 빛의 길을 함께 강조했어요. 1번은 눈으로, 2번은 흰 면으로 갑니다.';
			return;
		}
		emphasis = 'direct';
		live = '빛의 길을 차례로 강조합니다. 2번은 곧장 통과한 빛, 1번은 공기에서 흩어진 빛이에요.';
		timers = [
			setTimeout(() => {
				emphasis = 'scattered';
			}, 1000),
			setTimeout(() => {
				stop();
				live = '빛의 길 보기가 끝났어요. 각 색의 빛은 같은 색을 유지합니다.';
			}, 2000)
		];
	}
	onMount(() => {
		mounted = true;
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		const motion = () => {
			reduced = media.matches;
			stop();
		};
		motion();
		media.addEventListener('change', motion);
		const visibility = () => {
			if (document.hidden) stop();
		};
		document.addEventListener('visibilitychange', visibility);
		const observer = new IntersectionObserver((entries) => {
			if (!entries[0].isIntersecting) stop();
		});
		observer.observe(root);
		return () => {
			stop();
			observer.disconnect();
			media.removeEventListener('change', motion);
			document.removeEventListener('visibilitychange', visibility);
		};
	});
</script>

<figure
	class="sky-explorer"
	bind:this={root}
	data-testid="sky-explorer"
	data-elevation={elevation}
	data-emphasis={emphasis}
	aria-labelledby={`${id}-title`}
>
	<h3 id={`${id}-title`}>같은 햇빛, 달라지는 길</h3>
	<p class="instruction">태양을 낮춰 보세요. 공기는 그대로인데 빛의 길이 길어져요.</p>
	{#if mounted}
		<div class="presets" role="group" aria-label="태양의 높이 고르기">
			<button type="button" aria-pressed={elevation === 70} onclick={() => setElevation(70)}
				>태양이 높을 때</button
			>
			<button type="button" aria-pressed={elevation === 5} onclick={() => setElevation(5)}
				>태양이 낮을 때</button
			>
		</div>
		<div class="range-label">
			<label for={`${id}-height`}>태양의 높이</label><output for={`${id}-height`}
				>{elevation}°</output
			>
		</div>
		<input
			id={`${id}-height`}
			type="range"
			min="5"
			max="80"
			step="1"
			value={elevation}
			oninput={(event) => setElevation(event.currentTarget.valueAsNumber, false)}
			onchange={() => {
				live = explanation;
			}}
		/>
	{/if}
	<p class="explanation">{explanation}</p>
	<SkyLandscape {elevation} />
	<p class="diagram-heading">공기 속에서는 어떤 일이 일어날까요?</p>
	<SkyRayDiagram {elevation} {emphasis} />
	<ol class="ray-legend">
		<li><strong>하늘에서 흩어져 오는 빛</strong><span>공기에서 방향을 바꿔 눈으로 와요.</span></li>
		<li><strong>공기를 통과한 햇빛</strong><span>곧장 지나온 빛을 흰 면에서 비교해요.</span></li>
	</ol>
	<p class="small">
		점선은 파란 계열, 짧은 점선은 초록 계열, 실선은 빨간 계열이에요. 빨간빛도 일부 흩어지고,
		파란빛도 일부 통과해요.
	</p>
	{#if mounted}
		<div class="actions">
			<button type="button" onclick={highlight}>빛의 길 보기</button>
			<button
				type="button"
				onclick={() => {
					setElevation(70);
					live = '처음의 높은 태양으로 돌아왔어요.';
				}}>처음으로</button
			>
		</div>
		<p class="small">
			{reduced
				? '움직임 없이 두 빛의 길을 함께 강조해요.'
				: '2초 동안 길을 차례로 강조해요. 실제 빛의 속도를 나타내지는 않아요.'}
		</p>
	{:else}
		<p class="diagram-heading">태양이 낮을 때의 같은 풍경과 빛의 길</p>
		<SkyLandscape elevation={5} /><SkyRayDiagram elevation={5} />
		<p>{skyExplanation(5)}</p>
	{/if}
	<p class="sr-only" role="status">{live}</p>
	<figcaption>
		<p class="small">
			빛의 길과 색의 변화를 설명하는 그림입니다. 실제 하늘의 색이나 오늘의 날씨를 계산한 화면은
			아닙니다. 공기층의 두께와 물체 크기는 알아보기 쉽게 그렸어요.
		</p>
		<ArticleDisclosure class="model-notes" label="그림의 계산 방법">
			<p>
				그림의 색은 설명을 위해 정했습니다. 아래 계산값으로 하늘색을 만든 것은 아닙니다. 빛의 경로
				그림도 실제 지구의 크기·거리 비례가 아닙니다.
			</p>
			<p>
				태양의 높이 h는 겉보기 높이입니다. 상대 공기량 m = 1 ÷ [sin(h) + 0.50572 × (h +
				6.07995)⁻¹·⁶³⁶⁴]. 각도는 도 단위이며, sin 계산 때 라디안으로 바꿉니다. 현재 m은 약 {sample.airmass.toFixed(
					2
				)}입니다. <a href="#source-sky-airmass">공기량 식의 출처 ↗</a>
			</p>
			<p>
				레이리 산란 계수를 (550nm ÷ 파장)⁴로 비교하고, 통과 비율 T = exp(−0.1 × 계수 × m)로
				계산합니다. 550nm에서의 광학 깊이 0.1은 차이를 보여주기 위해 고른 설정값이지, 어디서나 같은
				공기의 상수가 아닙니다. <a href="#source-sky-rayleigh">산란의 파장 의존성 ↗</a>
			</p>
			<table class="transmission-table">
				<caption>각 파장의 처음 빛을 각각 100%로 놓았을 때, 곧장 통과한 비율</caption><thead
					><tr><th scope="col">대표 파장</th><th scope="col">통과 비율</th></tr></thead
				><tbody
					>{#each sample.bands as band (band.id)}<tr
							><th scope="row">{band.label}<small>{Math.round(band.wavelengthM * 1e9)}nm</small></th
							><td>{(band.transmission * 100).toFixed(1)}%</td></tr
						>{/each}</tbody
				>
			</table>
			<p>
				세 값은 따로 비교하는 비율로, 합쳐서 100%가 되는 색의 비중이 아닙니다. 450·550·650nm는
				대표로 고른 파장일 뿐입니다. 흩어진 양(1−T)을 눈에 도착하는 밝기로 취급하지 않습니다. 태양빛
				전체의 색 구성, 여러 번의 산란, 먼지·구름, 눈의 색 반응은 계산하지 않습니다.
			</p>
		</ArticleDisclosure>
	</figcaption>
</figure>

<style>
	.sky-explorer {
		margin: 30px 0 0;
		padding: 28px;
		border-radius: 10px;
		background: var(--deep);
		color: #edf4f1;
		--muted: #b7ced1;
		--teal: #b7dce4;
	}
	h3 {
		margin: 0;
		font-size: 23px;
		color: inherit;
	}
	p {
		color: #c4d8dc;
		font-size: 15px;
		line-height: 1.8;
	}
	.instruction {
		margin: 10px 0 20px;
	}
	.presets,
	.actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	button {
		font: inherit;
		font-size: 14px;
		min-height: 44px;
		border: 1px solid #7babb5;
		border-radius: 5px;
		color: #edf4f1;
		background: transparent;
		padding: 10px 15px;
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		background: #d2e4e3;
		color: #12353e;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 2px solid #f1be85;
		outline-offset: 4px;
	}
	.range-label {
		display: flex;
		justify-content: space-between;
		margin-top: 24px;
		font-size: 14px;
	}
	output {
		font: 13px var(--font-mono);
	}
	input {
		width: 100%;
		height: 44px;
		accent-color: #9cc9d0;
		cursor: pointer;
	}
	.explanation {
		min-height: 3.6em;
		margin: 8px 0 20px;
	}
	.diagram-heading {
		margin: 28px 0 0;
		font-weight: 650;
		color: #edf4f1;
	}
	.ray-legend {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px 25px;
		padding-left: 20px;
		font-size: 14px;
	}
	.ray-legend span {
		display: block;
		font-size: 13px;
		color: #b7ced1;
		margin-top: 5px;
	}
	.small {
		font-size: 13px;
	}
	.actions {
		margin-top: 20px;
	}
	figcaption {
		margin-top: 20px;
	}
	figcaption p {
		font-size: 13px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 16px;
		font-size: 13px;
		color: #c4d8dc;
		background: transparent;
	}
	caption {
		text-align: left;
		margin-bottom: 12px;
	}
	th,
	td {
		padding: 8px 4px;
		text-align: left;
		border-bottom: 1px solid #36535c;
		background: transparent;
	}
	small {
		display: block;
		font: 12px var(--font-mono);
	}
	@media (max-width: 500px) {
		.sky-explorer {
			padding: 20px 16px;
		}
		.ray-legend {
			grid-template-columns: 1fr;
		}
		h3 {
			font-size: 21px;
		}
		.explanation {
			min-height: 5.4em;
		}
	}
</style>
