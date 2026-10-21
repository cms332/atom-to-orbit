<script lang="ts">
	import { MIN_EXPONENT, MAX_EXPONENT, power, toPosition } from '$lib/utils/scales';
	let { exponent = Math.log10(12_742_000) }: { exponent?: number } = $props();
	const decades = Array.from(
		{ length: Math.floor(MAX_EXPONENT) - MIN_EXPONENT + 1 },
		(_, i) => i + MIN_EXPONENT
	);
	const lastDecade = Math.floor(MAX_EXPONENT);
	const labels = decades.filter((e) => e % 5 === 0 || e === lastDecade);
	let cursor = $derived(Math.max(0, Math.min(1, toPosition(10 ** exponent))) * 1000);
</script>

<svg
	viewBox="0 0 1000 36"
	preserveAspectRatio="none"
	role="img"
	aria-label="로그 눈금. 탐험 범위는 10의 마이너스 10제곱 미터부터 태양의 지름까지입니다. 한 눈금마다 길이가 10배가 됩니다."
>
	{#each decades as e (e)}<line
			x1={toPosition(10 ** e) * 1000}
			x2={toPosition(10 ** e) * 1000}
			y1={labels.includes(e) ? 8 : 20}
			y2="32"
			stroke="currentColor"
			stroke-width={labels.includes(e) ? 1.2 : 0.7}
			opacity={labels.includes(e) ? 0.65 : 0.25}
		/>{/each}
	<path d="M0 32H1000" stroke="currentColor" opacity=".7" />
	<path data-testid="axis-cursor" d={`M${cursor} 8v26`} stroke="#E6BB82" stroke-width="2" /><path
		d={`M${-6 + cursor} 2h12l-6 10z`}
		fill="#E6BB82"
	/>
</svg>
<div class="tick-labels" aria-hidden="true">
	{#each labels as e (e)}<span
			style:left={`${toPosition(10 ** e) * 100}%`}
			class:first={e === MIN_EXPONENT}
			class:last={e === lastDecade}
			class:intermediate={e === -5 || e === 5}>10{power(e)}<small> m</small></span
		>{/each}
</div>

<style>
	svg {
		display: block;
		width: calc(100% - 22px);
		height: 36px;
		margin-inline: 11px;
		color: #a9c1c5;
		overflow: visible;
	}
	.tick-labels {
		position: relative;
		height: 27px;
		margin: 8px 11px 0;
		color: #c2d2d5;
		font: 12px/1.5 var(--font-mono);
	}
	.tick-labels span {
		position: absolute;
		transform: translateX(-50%);
		white-space: nowrap;
	}
	.tick-labels .first {
		transform: none;
	}
	.tick-labels .last {
		transform: translateX(-100%);
	}
	small {
		font: inherit;
	}
	@media (max-width: 600px) {
		.intermediate {
			display: none;
		}
		.tick-labels {
			font-size: 11px;
		}
		small {
			display: none;
		}
	}
</style>
