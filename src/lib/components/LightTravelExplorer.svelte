<script lang="ts">
	import { onMount } from 'svelte';
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	import {
		lightTargets,
		clampLightProgress,
		lightElapsedLabel,
		lightElapsedReading,
		lightElapsedParts,
		lightArrivalLabel,
		LIGHT_ANIMATION_MS
	} from '$lib/data/starlight';
	let selected = $state(0);
	let progress = $state(0);
	let readoutProgress = $state(0);
	let playing = $state(false);
	let mounted = $state(false);
	let reducedMotion = $state(false);
	let motionOptIn = $state(false);
	let announcement = $state('');
	let animationFrame = 0;
	const uid = $props.id();
	const target = $derived(lightTargets[selected]);
	const arrival = $derived(lightArrivalLabel(target));
	const elapsedParts = $derived(lightElapsedParts(target, readoutProgress));
	const elapsedReading = $derived(lightElapsedReading(target, readoutProgress));
	const needsMotionOptIn = $derived(reducedMotion && !motionOptIn);
	function pause() {
		cancelAnimationFrame(animationFrame);
		playing = false;
		readoutProgress = progress;
	}
	function reset() {
		pause();
		progress = 0;
		readoutProgress = 0;
		announcement = '출발 위치로 돌아왔습니다.';
	}
	function select(index: number) {
		reset();
		selected = index;
		announcement = `${lightTargets[index].name} 선택. 빛의 이동 시간은 ${lightTargets[index].timeLabel}입니다.`;
	}
	function play() {
		if (playing) {
			pause();
			return;
		}
		// This button explicitly offers motion when the device prefers reduced motion.
		// Consent is local to this mounted figure; the static alternative remains available.
		if (needsMotionOptIn) motionOptIn = true;
		if (progress >= 1) progress = 0;
		readoutProgress = progress;
		announcement = '';
		const from = progress;
		const started = performance.now();
		let lastReadoutAt = started;
		playing = true;
		function tick(now: number) {
			if (!playing) return;
			progress = clampLightProgress(from + (now - started) / LIGHT_ANIMATION_MS);
			if (progress === 1) {
				pause();
				announcement = arrival;
			} else {
				// Keep motion smooth, but don't repaint rapidly changing digits every frame.
				if (now - lastReadoutAt >= 100) {
					readoutProgress = progress;
					lastReadoutAt = now;
				}
				animationFrame = requestAnimationFrame(tick);
			}
		}
		animationFrame = requestAnimationFrame(tick);
	}
	function scrub(event: Event) {
		pause();
		progress = clampLightProgress(Number((event.currentTarget as HTMLInputElement).value) / 100);
		readoutProgress = progress;
		announcement = progress === 1 ? arrival : '';
	}
	onMount(() => {
		mounted = true;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const motionChanged = () => {
			pause();
			reducedMotion = motion.matches;
			motionOptIn = false;
		};
		motionChanged();
		const visibilityChanged = () => {
			if (document.hidden) pause();
		};
		document.addEventListener('visibilitychange', visibilityChanged);
		motion.addEventListener('change', motionChanged);
		return () => {
			cancelAnimationFrame(animationFrame);
			document.removeEventListener('visibilitychange', visibilityChanged);
			motion.removeEventListener('change', motionChanged);
		};
	});
</script>

<figure
	class="light-travel"
	aria-labelledby={`${uid}-title`}
	data-testid="light-travel"
	data-target={target.id}
	data-progress={progress}
	data-playing={playing}
	data-motion={needsMotionOptIn ? 'reduced' : 'animated'}
>
	<p class="eyebrow">빛의 여행</p>
	<h3 id={`${uid}-title`}>지금 도착한 빛은<br />언제 출발했을까?</h3>
	<div class="targets" role="group" aria-label="빛이 출발한 천체">
		{#each lightTargets as item, index (item.id)}
			<button
				type="button"
				disabled={!mounted}
				aria-pressed={selected === index}
				onclick={() => select(index)}>{item.name}</button
			>
		{/each}
	</div>
	<div class="target-reading">
		<div>
			<span class="kind">{target.kind}</span>
			<h4>{target.name}</h4>
			<p>지구까지 {target.distanceLabel}</p>
		</div>
		<div class="travel-time">
			<span>빛이 지구까지 오는 데 걸리는 시간</span><strong>{target.timeLabel}</strong>
		</div>
	</div>
	<p class="target-note">{target.note}</p>
	<div class="light-path" style:--light-x={`${((64 + 492 * progress) / 620) * 100}%`}>
		<svg viewBox="0 0 620 200" role="img" aria-labelledby={`${uid}-svg-title ${uid}-svg-desc`}>
			<title id={`${uid}-svg-title`}>{target.name}에서 지구로 오는 빛의 길</title>
			<desc id={`${uid}-svg-desc`}
				>왼쪽 천체에서 오른쪽 지구로 가는 빛을 밝은 점으로 나타냈습니다. 점은 이동을 설명하는
				표시이며, 천체가 한 번만 빛을 내는 것은 아닙니다. 천체의 크기와 간격은 실제 비율이 아닙니다.</desc
			>
			<defs
				><radialGradient id={`${uid}-glow`}
					><stop stop-color="#f8dba9" stop-opacity="0.5" /><stop
						offset="1"
						stop-color="#f8dba9"
						stop-opacity="0"
					/></radialGradient
				></defs
			>
			<path d="M64 108H556" stroke="#66898e" stroke-dasharray="3 6" />
			<path d={`M64 108H${64 + 492 * progress}`} stroke="#efbd83" stroke-width="2" />
			<g aria-hidden="true" data-testid="light-source-symbol">
				{#if target.kind === '은하'}
					<ellipse
						cx="64"
						cy="108"
						rx="35"
						ry="13"
						fill="#e6c9a4"
						fill-opacity="0.13"
						stroke="#c6ad8f"
						transform="rotate(-28 64 108)"
					/>
					<ellipse
						cx="64"
						cy="108"
						rx="23"
						ry="7"
						fill="#e6c9a4"
						fill-opacity="0.3"
						transform="rotate(-28 64 108)"
					/>
					<circle cx="64" cy="108" r="5" fill="#f8dba9" />
				{:else if target.id === 'moon'}
					<circle cx="64" cy="108" r="20" fill="#c4ceca" /><circle
						cx="58"
						cy="102"
						r="5"
						fill="#96a9a8"
					/><circle cx="71" cy="116" r="4" fill="#96a9a8" />
				{:else}
					<circle cx="64" cy="108" r="38" fill={`url(#${uid}-glow)`} /><circle
						cx="64"
						cy="108"
						r={target.id === 'sun' ? 21 : 11}
						fill={target.id === 'proxima' ? '#df9468' : '#f6d29c'}
					/>
				{/if}
				<circle cx="556" cy="108" r="23" fill="#3e8394" stroke="#9fcbcf" /><path
					d="M548 89l12 8-7 8 11 9-12 13-7-15 5-8-7-7Z"
					fill="#99b6a2"
				/>
			</g>
			<g aria-hidden="true"
				><circle cx={64 + 492 * progress} cy="108" r="24" fill={`url(#${uid}-glow)`} /><circle
					data-testid="light-marker"
					cx={64 + 492 * progress}
					cy="108"
					r="5"
					fill="#fff0d2"
					stroke="#e5b27e"
				/></g
			>
			<text x="64" y="58" text-anchor="middle">{target.id === 'moon' ? '반사된 빛' : '출발'}</text>
			<text x="556" y="58" text-anchor="middle">지구</text>
		</svg>
		<div
			class="elapsed-tracker"
			role="timer"
			aria-live="off"
			aria-label="빛의 경과 시간"
			data-testid="light-elapsed-tracker"
			data-progress={readoutProgress}
		>
			<span class="elapsed-label">경과 시간</span>
			<strong class="elapsed-reading"
				><span class="elapsed-prefix">약&nbsp;</span><span
					class="elapsed-value"
					style:width={`${elapsedParts.widthCh}ch`}>{elapsedParts.value}</span
				><span class="elapsed-unit">{elapsedParts.unit}</span></strong
			>
		</div>
	</div>
	<p class="arrival" data-testid="light-arrival">
		{progress === 1
			? arrival
			: progress === 0
				? '빛의 출발부터 지구에 도착할 때까지 따라가 보세요.'
				: '빛이 지구를 향해 오고 있어요.'}
	</p>
	{#if reducedMotion}
		<p class="motion-preference">
			기기의 ‘움직임 줄이기’ 설정이 켜져 있어요. 애니메이션은 아래 버튼으로 직접 켤 수 있어요.
		</p>
	{/if}
	<div class="playback">
		<button type="button" data-testid="light-play" disabled={!mounted} onclick={play}
			><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
			{playing
				? '일시 정지'
				: needsMotionOptIn
					? '애니메이션 켜고 따라가기'
					: '빛의 길 따라가기'}</button
		>
		<button type="button" disabled={!mounted} onclick={reset}>처음부터</button>
	</div>
	<label for={`${uid}-progress`} class="slider-label"
		>빛의 이동 위치 <span>{Math.round(progress * 100)}%</span></label
	>
	<input
		id={`${uid}-progress`}
		type="range"
		min="0"
		max="100"
		step="1"
		value={progress * 100}
		disabled={!mounted}
		aria-valuetext={`${Math.round(progress * 100)}%, 경과 시간 ${elapsedReading}`}
		onpointerdown={pause}
		onkeydown={pause}
		oninput={scrub}
	/>
	<div class="endpoints" aria-hidden="true">
		<span>{target.id === 'moon' ? '달에서 빛이 반사됨' : '빛이 출발함'}</span><span>지구 도착</span>
	</div>
	<p class="status screen-reader-only" role="status">
		{announcement}
	</p>
	<figcaption>
		<p>
			보기 쉽도록 애니메이션은 모든 장면을 {LIGHT_ANIMATION_MS / 1000}초로 보여줍니다. 실제 거리와
			시간 비율은 다릅니다. 경과 시간은 빛이 지나온 비율에 맞춰 보여줍니다. 천체의 크기와 간격도
			실제 비율이 아닙니다.
		</p>
		<p>물질이 없는 공간에서 빛의 속력은 같습니다. 달라지는 것은 건너오는 거리입니다.</p>
		<ArticleDisclosure class="model-notes" label="거리와 시간은 어떻게 계산했나요?">
			<div class="model-clock">
				<span>지금 위치까지 지나간 시간(계산값)</span><span data-testid="light-elapsed"
					>{lightElapsedLabel(target, progress)}</span
				>
			</div>
			<p>
				이동 시간 = 거리 ÷ 빛의 속도. 빛의 속도는 정확히 299,792,458m/s입니다. <a
					href="#source-starlight-c">광속의 출처 ↗</a
				>
			</p>
			<p>
				1년을 365.25일로 계산하면, 1광년 = 9,460,730,472,580,800m입니다. 달은 평균 거리 384,400km로
				약 1.282초, 태양은 1AU로 약 499.005초입니다. 위 계산값은 초 단위로 반올림해 8분 19초, 빛을
				따라가는 태양의 경과 시간은 10초 단위로 반올림해 도착할 때 약 8분 20초로 표시합니다. 빛의
				위치는 반올림하기 전의 이동 비율로 계산합니다. <a href="#source-starlight-jpl"
					>단위와 계산의 출처 ↗</a
				>
			</p>
			<p>
				프록시마 센타우리는 4.24광년, 시리우스는 8.6광년, 안드로메다은하는 250만 광년을 기준으로
				계산했습니다. 실제 거리는 대표값이며, 화면의 이동 위치에 따라 해당 시간의 일부를 보여줍니다.
				아주 먼 우주의 모든 천체에 그대로 적용하는 정밀한 계산기는 아닙니다.
			</p>
		</ArticleDisclosure>
	</figcaption>
</figure>

<div class="light-table-wrap">
	<table class="light-table">
		<caption>한눈에 비교하는 빛의 여행</caption><thead
			><tr
				><th scope="col">천체</th><th scope="col">지구까지 거리</th><th scope="col"
					>빛이 오는 시간</th
				></tr
			></thead
		><tbody>
			{#each lightTargets as item (item.id)}<tr
					><th scope="row">{item.name}<small>{item.kind}</small></th><td>{item.distanceLabel}</td
					><td>{item.timeLabel}</td></tr
				>{/each}
		</tbody>
	</table>
</div>

<style>
	.light-travel {
		margin: 36px 0 28px;
		padding: 32px;
		border-radius: 14px;
		background: var(--deep);
		color: #d8e6e8;
	}
	.light-travel .eyebrow {
		font-size: 12px;
		margin: 0 0 12px;
		color: #efbd83;
	}
	h3 {
		color: #f2f3ec;
		font-size: clamp(24px, 3vw, 32px);
		line-height: 1.45;
		margin: 0 0 24px;
	}
	.targets,
	.playback {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	button {
		min-height: 44px;
		padding: 10px 14px;
		background: transparent;
		color: #d8e6e8;
		border: 1px solid #78959b;
		border-radius: 5px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		background: #ead0ad;
		color: #102d35;
		border-color: #ead0ad;
		font-weight: 700;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 3px solid #efbd83;
		outline-offset: 4px;
	}
	button:disabled,
	input:disabled {
		cursor: default;
		opacity: 0.65;
	}
	.target-reading {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-top: 30px;
	}
	.kind {
		font-size: 12px;
		color: #b1c8cd;
	}
	h4 {
		font-size: 22px;
		color: #f2f3ec;
		margin: 4px 0 8px;
		line-height: 1.5;
	}
	.target-reading p,
	.travel-time span {
		font-size: 13px;
		margin: 0;
		color: #b1c8cd;
	}
	.travel-time {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.travel-time strong {
		font: 600 clamp(25px, 4vw, 36px) var(--font-mono);
		color: #efbd83;
		margin-top: 8px;
	}
	.light-travel .target-note {
		font-size: 14px;
		color: #d8e6e8;
		min-height: 3.6em;
		margin: 16px 0 0;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		margin: 0;
		overflow: visible;
	}
	svg text {
		fill: #b1c8cd;
		font-size: 15px;
	}
	.light-path {
		position: relative;
		font-size: 14px;
		margin: 28px 0 5em;
	}
	.elapsed-tracker {
		position: absolute;
		top: calc(54% + 28px);
		left: clamp(min(4.5em, 50%), var(--light-x), max(50%, calc(100% - 4.5em)));
		transform: translateX(-50%);
		width: 9em;
		max-width: 100%;
		text-align: center;
		line-height: 1.5;
		pointer-events: none;
	}
	.elapsed-label {
		display: block;
		font-size: 12px;
		color: #b1c8cd;
	}
	.elapsed-reading {
		display: inline-flex;
		align-items: baseline;
		font: 600 17px / 1.5 var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: #efbd83;
		white-space: nowrap;
	}
	.elapsed-prefix {
		white-space: pre;
	}
	.elapsed-value {
		flex: none;
		text-align: right;
	}
	.model-clock,
	.slider-label,
	.endpoints {
		display: flex;
		justify-content: space-between;
		gap: 16px;
	}
	.model-clock {
		font-size: 13px;
		color: #b1c8cd;
	}
	.model-clock span:last-child {
		font-family: var(--font-mono);
		color: #efbd83;
	}
	.light-travel .arrival {
		min-height: 3.6em;
		font-size: 15px;
		margin: 16px 0;
		color: #f2f3ec;
	}
	.light-travel .motion-preference {
		font-size: 13px;
		line-height: 1.8;
		color: #b1c8cd;
		margin: 0 0 16px;
	}
	.playback button:first-child {
		color: #102d35;
		background: #ead0ad;
		border-color: #ead0ad;
	}
	.slider-label {
		font-size: 13px;
		margin-top: 24px;
	}
	input {
		display: block;
		width: 100%;
		height: 44px;
		margin: 0;
		accent-color: #b7d9dc;
		cursor: pointer;
	}
	.endpoints {
		font-size: 12px;
		color: #b1c8cd;
	}
	figcaption {
		margin-top: 24px;
	}
	.light-travel figcaption p,
	.light-travel :global(.model-notes p) {
		font-size: 12px;
		line-height: 1.9;
		color: #b1c8cd;
	}
	.light-travel :global(.model-notes) {
		--teal: #b7d9dc;
		--ink: #d8e6e8;
		--muted: #b1c8cd;
	}
	.status {
		font-size: 13px;
		color: #b1c8cd;
	}
	.status:empty {
		display: none;
	}
	.screen-reader-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.light-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	caption {
		text-align: left;
		font-weight: 650;
		font-size: 19px;
		margin-bottom: 12px;
	}
	th,
	td {
		padding: 13px 8px;
		text-align: left;
		border-bottom: 1px solid var(--line);
	}
	thead {
		font-size: 12px;
		color: var(--muted);
	}
	tbody th {
		font-weight: 600;
	}
	small {
		display: block;
		font-size: 11px;
		font-weight: 400;
		color: var(--muted);
	}
	@media (max-width: 600px) {
		.light-travel {
			padding: 24px 18px;
			margin-inline: -4px;
		}
		.targets button {
			font-size: 13px;
			padding-inline: 11px;
		}
		.target-reading {
			grid-template-columns: 1fr;
			gap: 18px;
		}
		.target-note {
			min-height: 5.4em;
		}
		svg text {
			font-size: 25px;
		}
		.light-table {
			font-size: 12px;
		}
		th,
		td {
			padding: 12px 4px;
		}
	}
</style>
