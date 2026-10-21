<script lang="ts">
	import { onMount } from 'svelte';
	import type { OrbitFrame } from '$lib/utils/orbit-model';
	import { motionScene } from '$lib/utils/motion-scene';
	let frame = $state<OrbitFrame>('solar');
	let phase = $state(1);
	let mounted = $state(false);
	let playing = $state(false);
	let animationFrame = 0;
	const uid = $props.id();
	const scene = $derived(motionScene(frame, phase));
	function pausePlayback() {
		cancelAnimationFrame(animationFrame);
		playing = false;
	}
	function togglePlayback() {
		if (playing) {
			pausePlayback();
			return;
		}
		if (phase >= 1) phase = 0;
		const from = phase;
		const started = performance.now();
		// Explicit playback follows the same path more slowly when motion reduction is requested.
		const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
			? 18_000
			: 12_000;
		playing = true;
		function tick(now: number) {
			if (!playing) return;
			phase = Math.min(1, from + (now - started) / duration);
			if (phase >= 1) pausePlayback();
			else animationFrame = requestAnimationFrame(tick);
		}
		animationFrame = requestAnimationFrame(tick);
	}
	onMount(() => {
		mounted = true;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const visibilityChanged = () => {
			if (document.hidden) pausePlayback();
		};
		document.addEventListener('visibilitychange', visibilityChanged);
		motion.addEventListener('change', pausePlayback);
		return () => {
			cancelAnimationFrame(animationFrame);
			document.removeEventListener('visibilitychange', visibilityChanged);
			motion.removeEventListener('change', pausePlayback);
		};
	});
</script>

{#snippet drawing(view: OrbitFrame, progress: number)}
	{@const viewScene = motionScene(view, progress)}
	<svg
		viewBox="0 0 640 310"
		role="img"
		aria-label={view === 'solar'
			? '태양을 기준으로 약 한 바퀴의 지구 공전을 본 투영도'
			: '은하의 국부 고정 기준에서 태양 이동과 지구 공전을 함께 본 투영도'}
		data-testid={`motion-${view}-diagram`}
	>
		<desc
			>빈 원은 지구의 출발 위치, 청록색 실선은 지나온 길, 옅은 점선은 약 한 바퀴의 전체 경로입니다.
			구리색 원과 점선은 태양과 태양의 이동 경로입니다.</desc
		>
		<path d="M30 155H610M320 30V280" stroke="#c2d2d5" stroke-width="1" stroke-dasharray="3 7" />
		<path
			d={viewScene.fullPath}
			fill="none"
			stroke="#89a6a6"
			stroke-width="1.5"
			stroke-dasharray="3 5"
		/>
		{#if view === 'galactic'}<path
				d={viewScene.sunPath}
				fill="none"
				stroke="#9a6c3e"
				stroke-width="1.5"
				stroke-dasharray="7 5"
			/>{/if}
		<path
			d={viewScene.pastPath}
			fill="none"
			stroke="var(--teal)"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<circle
			cx={viewScene.start[0]}
			cy={viewScene.start[1]}
			r="5"
			fill="var(--bg)"
			stroke="var(--teal)"
			stroke-width="2"
		/>
		<circle
			cx={viewScene.sun[0]}
			cy={viewScene.sun[1]}
			r="10"
			fill="var(--copper)"
			stroke="var(--ink)"
			stroke-width="1.2"
		/>
		<circle
			cx={viewScene.earth[0]}
			cy={viewScene.earth[1]}
			r="7"
			fill="var(--teal)"
			stroke="var(--bg)"
			stroke-width="2"
		/>
	</svg>
{/snippet}

<figure
	class="motion-frames"
	aria-label="같은 운동, 다른 기준"
	data-testid="motion-frame-comparison"
	data-frame={frame}
	data-phase={phase}
	data-playing={playing}
	data-relative-position={scene.current.earth.map((v, i) => v - scene.current.sun[i]).join(',')}
>
	<div class="figure-heading">
		<h3>같은 운동, 다른 기준</h3>
		<div class="frame-buttons" role="group" aria-label="운동을 바라보는 기준">
			<button
				type="button"
				disabled={!mounted}
				aria-pressed={frame === 'solar'}
				onclick={() => {
					frame = 'solar';
				}}>태양 기준</button
			>
			<button
				type="button"
				disabled={!mounted}
				aria-pressed={frame === 'galactic'}
				onclick={() => {
					frame = 'galactic';
				}}>은하 기준</button
			>
		</div>
	</div>
	<p class="frame-summary" role="status" aria-live="polite" aria-atomic="true">
		<strong>{frame === 'solar' ? '태양 고정' : '태양도 이동'}</strong>
		<span
			>{frame === 'solar'
				? '지구의 길은 태양 둘레로 거의 닫힌 타원을 그립니다.'
				: '태양의 이동이 더해져 지구의 지나온 길이 열립니다.'}</span
		>
	</p>
	<button
		type="button"
		class="playback-button"
		data-testid="motion-playback"
		disabled={!mounted}
		aria-label={`${frame === 'solar' ? '태양' : '은하'} 기준 ${playing ? '일시 정지' : '재생하기'}`}
		aria-pressed={playing}
		aria-controls={`${uid}-drawing ${uid}-time`}
		onclick={togglePlayback}
		onkeydown={(event) => {
			if (event.key === 'Escape') pausePlayback();
		}}
	>
		<svg class="playback-icon" viewBox="0 0 12 12" aria-hidden="true">
			{#if playing}<path d="M3 2v8M9 2v8" stroke="currentColor" stroke-width="2" />{:else}<polygon
					points="3,2 10,6 3,10"
					fill="currentColor"
				/>{/if}
		</svg>
		{playing ? '일시 정지' : '재생하기'}
	</button>
	<div class="drawing" id={`${uid}-drawing`}>{@render drawing(frame, phase)}</div>
	<div class="legend" aria-label="도식 범례">
		<span><i class="earth"></i>지구와 지나온 길</span><span><i class="sun"></i>태양</span><span
			><i class="start"></i>출발 위치</span
		>
		{#if frame === 'galactic'}<span><i class="sun-path"></i>태양의 이동 경로</span>{/if}
	</div>
	<div class="time-control">
		<label for={`${uid}-time`}>같은 1년을 따라가기</label>
		<output for={`${uid}-time`} aria-live="off">{Math.round(phase * 100)}%</output>
		<input
			id={`${uid}-time`}
			aria-valuetext={`한 바퀴의 ${Math.round(phase * 100)}%`}
			type="range"
			min="0"
			max="1"
			step="0.01"
			value={phase}
			disabled={!mounted}
			oninput={(event) => {
				pausePlayback();
				phase = Number(event.currentTarget.value);
			}}
		/>
		<div class="time-labels" aria-hidden="true"><span>시작</span><span>약 1년 후 →</span></div>
	</div>
	<noscript>
		<p>
			JavaScript 없이도 두 기준을 비교할 수 있습니다. 위는 태양 기준, 아래는 같은 기간의 은하
			기준입니다.
		</p>
		<div class="drawing">{@render drawing('galactic', 1)}</div>
	</noscript>
	<figcaption>
		같은 시각·같은 공전 계산을 같은 방향에서 투영했습니다. 기준만 바꾸며 태양과 지구의 상대 위치는
		유지됩니다.<br />
		<strong>표시 모형 · 태양의 은하 이동 성분은 1/20 · 천체 기호는 크기 비례 아님.</strong>
		실제 3D 궤적의 모습은 시선에 따라 달라집니다. J2000 + 8년부터 약 1년을 계산했으며 실시간 위치가 아닙니다.
		<a href="#source-motion-jpl">계산의 출처 ↗</a>
	</figcaption>
</figure>

<style>
	.motion-frames {
		margin: 32px 0 40px;
		padding: 26px;
		background: var(--soft-teal);
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	h3 {
		font-size: 20px;
		margin: 0 0 18px;
	}
	.frame-buttons {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	button {
		min-height: 44px;
		padding: 10px 18px;
		border: 1px solid var(--teal);
		border-radius: 5px;
		background: transparent;
		color: var(--teal);
		cursor: pointer;
		font-size: 14px;
		font-weight: 650;
	}
	button[aria-pressed='true'] {
		background: var(--teal);
		color: white;
	}
	button:disabled {
		cursor: default;
	}
	.playback-button {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin-top: 16px;
		min-width: 128px;
	}
	.playback-icon {
		width: 14px;
		height: 14px;
		flex: none;
	}
	.drawing {
		margin-top: 16px;
	}
	.drawing :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
		font-size: 12px;
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}
	i {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--teal);
	}
	i.sun {
		background: var(--copper);
		border: 1px solid var(--ink);
	}
	i.start {
		background: var(--bg);
		border: 1px solid var(--teal);
	}
	i.sun-path {
		width: 18px;
		height: 0;
		border-radius: 0;
		background: none;
		border-top: 2px dashed #9a6c3e;
	}
	.time-control {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		margin-top: 26px;
		font-size: 13px;
	}
	output {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}
	input {
		grid-column: 1 / -1;
		width: 100%;
		min-width: 0;
		margin: 0;
		min-height: 44px;
		accent-color: var(--teal);
	}
	.time-labels {
		grid-column: 1 / -1;
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: var(--muted);
	}
	.frame-summary {
		font-size: 14px;
		line-height: 1.7;
		color: var(--ink);
		margin: 18px 0 0;
		padding-left: 12px;
		border-left: 2px solid var(--teal);
		min-height: 3.4em;
	}
	.frame-summary strong {
		display: block;
	}
	figcaption {
		margin-top: 18px;
		color: var(--muted);
		font-size: 12px;
		line-height: 1.9;
	}
	figcaption strong {
		font-weight: 650;
	}
	figcaption a {
		display: inline-block;
		padding-block: 5px;
	}
	noscript p {
		font-size: 13px;
		line-height: 1.8;
	}
	@media (max-width: 600px) {
		.motion-frames {
			padding: 20px 16px;
		}
		.legend {
			gap: 9px 14px;
		}
		.frame-summary {
			min-height: 5.1em;
		}
	}
</style>
