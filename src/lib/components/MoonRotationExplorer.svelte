<script lang="ts">
	import { onMount } from 'svelte';
	import MoonOrbitPanel from './MoonOrbitPanel.svelte';
	let turn = $state(0),
		playing = $state(false),
		ready = $state(false),
		reduced = $state(false);
	let frame = 0;
	const steps = ['출발', '¼바퀴', '반 바퀴', '¾바퀴', '한 바퀴'];
	function stop() {
		cancelAnimationFrame(frame);
		playing = false;
	}
	function seek(value: number) {
		stop();
		turn = value;
	}
	function toggle() {
		if (playing) {
			stop();
			return;
		}
		if (turn >= 1) turn = 0;
		const start = performance.now() - turn * 12000;
		playing = true;
		function tick(now: number) {
			turn = Math.min(1, (now - start) / 12000);
			if (turn < 1) frame = requestAnimationFrame(tick);
			else stop();
		}
		frame = requestAnimationFrame(tick);
	}
	onMount(() => {
		ready = true;
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		function preference() {
			reduced = media.matches;
			stop();
		}
		preference();
		media.addEventListener('change', preference);
		return () => {
			stop();
			media.removeEventListener('change', preference);
		};
	});
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) stop();
	}}
/>
<figure class="lab">
	<h3>달에 붙인 표식을 따라가요</h3>
	<div class="panels">
		{#each [true, false] as spinning (spinning)}
			<figure>
				<figcaption>{spinning ? '몸도 도는 실제 달' : '몸을 돌리지 않는 가상의 달'}</figcaption>
				<MoonOrbitPanel {spinning} {turn} />
			</figure>{/each}
	</div>
	{#if ready}
		<div class="controls">
			{#each steps as label, i (label)}<button
					aria-pressed={turn === i / 4}
					onclick={() => seek(i / 4)}>{label}</button
				>{/each}
		</div>
		<label
			>지구 둘레를 돈 만큼 · {Math.round(turn * 100)}%<input
				type="range"
				min="0"
				max="1"
				step="0.001"
				value={turn}
				oninput={(e) => seek(+e.currentTarget.value)}
			/></label
		>
		<div class="controls">
			{#if !reduced}<button onclick={toggle}>{playing ? 'Ⅱ 일시정지' : '▶ 재생'}</button
				>{/if}<button onclick={() => seek(0)}>처음으로</button>
		</div>
	{/if}
	<p>
		{turn === 0.5
			? '반 바퀴! 실제 달의 표식은 지구를 향하고, 가상의 달 표식은 지구 반대쪽을 향해요.'
			: '두 달은 같은 길을 가요. 주황색 세모가 지구 쪽을 향하는지 살펴보세요.'}
	</p>
	<details class="model-notes">
		<summary>다섯 장면을 글로 비교하기</summary>
		<p>
			출발할 때 두 표식은 모두 왼쪽의 지구를 봐요. 실제 달의 표식은 ¼바퀴에서 아래, 반 바퀴에서
			오른쪽, ¾바퀴에서 위를 향해요. 그쪽에는 늘 지구가 있어요. 가상의 달 표식은 다섯 장면 모두
			왼쪽을 봐요. 한 바퀴 뒤에는 두 표식 모두 다시 지구를 향해요.
		</p>
		<a href="#source-moon-face-rotation">달의 회전 자료 보기</a>
	</details>
	<small>지구 위쪽에서 내려다본 교육용 모형이에요. 크기와 거리는 보기 쉽게 그렸어요.</small>
</figure>

<style>
	.lab {
		background: #102b33;
		color: #f5f5ed;
		padding: clamp(14px, 3vw, 28px);
		border-radius: 10px;
		margin: 24px 0;
	}
	.lab h3 {
		margin: 0 0 18px;
	}
	.panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.panels figure {
		margin: 0;
		min-width: 0;
	}
	.panels figcaption {
		text-align: center;
		font-weight: 650;
		font-size: clamp(12px, 2.5vw, 16px);
		min-height: 2.8em;
	}
	.panels :global(svg) {
		width: 100%;
		display: block;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.controls button {
		background: transparent;
		color: inherit;
		border: 1px solid #84a4a8;
		padding: 6px 10px;
		border-radius: 5px;
		min-height: 44px;
	}
	.controls button[aria-pressed='true'] {
		background: #efcca1;
		color: #172d31;
	}
	.lab label,
	.lab small {
		display: block;
		margin-block: 14px;
	}
	.lab input {
		display: block;
		width: 100%;
		accent-color: #efcca1;
		min-height: 36px;
	}
	.lab details {
		margin-block: 12px;
	}
	.lab summary {
		cursor: pointer;
	}
	.model-notes a {
		color: inherit;
	}
	.lab p {
		color: #ecf1ef;
	}
	@media (max-width: 480px) {
		.panels {
			grid-template-columns: 1fr;
		}
		.panels figure {
			display: grid;
			grid-template-columns: minmax(65px, 1fr) minmax(0, 2fr);
			align-items: center;
		}
		.panels figcaption {
			min-height: 0;
			text-align: left;
		}
		.panels :global(svg) {
			max-height: 160px;
		}
	}
</style>
