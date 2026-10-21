<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { trackEvent } from '$lib/analytics';
	import { orbitPlanets, MAX_ORBIT_YEARS, EMPHASIZED_SPEED } from '$lib/data/orbits';
	import { orbitChapters, type CameraView } from '$lib/data/orbit-story';
	import type { OrbitFrame } from '$lib/utils/orbit-model';
	import type { OrbitController } from '$lib/orbit/renderer';
	import { ORBIT_MOTION_RATE, STORY_STEP_SECONDS } from '$lib/orbit/timing';
	import OrbitFallback from './OrbitFallback.svelte';
	let host: HTMLDivElement;
	let stage: HTMLElement;
	let heading: HTMLDivElement;
	let bottomUi: HTMLDivElement;
	let storyPanel = $state<HTMLDivElement>();
	let settingsButton: HTMLButtonElement;
	let settingsPanel = $state<HTMLElement>();
	let dismissalPointer: number | undefined;
	let controller: OrbitController | undefined;
	let alive = true;
	let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let frame = $state<OrbitFrame>('galactic');
	let speedFactor = $state(EMPHASIZED_SPEED);
	let years = $state(8);
	let yearsPerSecond = $state(0.1);
	let trails = $state(true);
	let orbits = $state(true);
	let labels = $state(true);
	let selected = $state('sun');
	let physicalSizes = $state(false);
	let following = $state(false);
	let reducedMotion = $state(false);
	let settings = $state(false);
	let chapter = $state(0);
	let story = $state(false);
	let storyPaused = $state(false);
	let storyFinished = $state(false);
	let elapsed = 0;
	const ready = $derived(status === 'ready');
	const storyPlaying = $derived(story && !storyPaused && !storyFinished);
	const currentChapter = $derived(orbitChapters[chapter]);
	const motionRate = $derived(ORBIT_MOTION_RATE * (story ? (currentChapter.motionRate ?? 1) : 1));
	const selectedPlanet = $derived(orbitPlanets.find((p) => p.id === selected));
	function frameScene() {
		if (!alive || !stage || !heading || !bottomUi) return;
		const bounds = stage.getBoundingClientRect();
		const top = heading.getBoundingClientRect().bottom - bounds.top + 16;
		const bottom = bounds.bottom - bottomUi.getBoundingClientRect().top + 16;
		const beside =
			storyPanel && getComputedStyle(storyPanel).position === 'absolute'
				? storyPanel.getBoundingClientRect()
				: undefined;
		const right = beside ? bounds.right - beside.left + 16 : 0;
		const minimumScene = matchMedia('(max-height: 600px) and (min-width: 600px)').matches
			? 100
			: 180;
		// Enlarged text may grow the page rather than consume the whole 3D viewing area.
		stage.style.minHeight = `${Math.ceil(Math.max(300, top + bottom + minimumScene))}px`;
		controller?.setFramingArea({
			x: 0,
			y: top,
			width: Math.max(1, bounds.width - right),
			height: Math.max(1, bounds.height - top - bottom)
		});
	}
	$effect(() => {
		// Wait for the current chapter's actual text height, including font reflow.
		void [story, chapter, status];
		void tick().then(frameScene);
	});
	function manual() {
		story = false;
		storyPaused = false;
		storyFinished = false;
		elapsed = 0;
	}
	function pauseForCamera() {
		if (story && !storyFinished) storyPaused = true;
	}
	function camera(preset: CameraView) {
		following = false;
		physicalSizes = preset === 'earth-journey';
		controller?.view(preset, { frame, speedFactor, trailYears: 4 });
	}
	async function start() {
		status = 'loading';
		try {
			const { createOrbitRenderer } = await import('$lib/orbit/renderer');
			if (!alive) return;
			controller?.dispose();
			controller = createOrbitRenderer(host, years, {
				getOptions: () => ({
					frame,
					speedFactor,
					yearsPerSecond: yearsPerSecond * motionRate,
					trails,
					orbits,
					labels,
					visibleTrails: orbitPlanets.map((p) => p.id),
					selected,
					trailYears: 4,
					reducedMotion
				}),
				onTime: (value) => {
					years = value;
				},
				onInteract: pauseForCamera,
				onSelect: choosePlanet,
				onFrame: (seconds) => {
					if (!storyPlaying) return;
					elapsed += seconds;
					if (elapsed >= STORY_STEP_SECONDS) {
						if (chapter === orbitChapters.length - 1) {
							storyFinished = true;
							trackEvent('orbit_story_complete', { chapters: orbitChapters.length });
						} else step(chapter + 1);
					}
				},
				onError: () => {
					status = 'error';
					manual();
				}
			});
			status = 'ready';
			camera(frame === 'galactic' ? 'trail' : 'inner');
		} catch {
			status = 'error';
		}
	}
	function changeView(value: OrbitFrame) {
		trackEvent('orbit_mode_change', { mode: value });
		manual();
		frame = value;
		selected = 'sun';
		camera(value === 'galactic' ? 'trail' : 'inner');
	}
	function mode(value: number) {
		manual();
		speedFactor = value;
		if (frame === 'galactic') camera('trail');
	}
	function choosePlanet(id: string) {
		trackEvent('orbit_target_select', { target: id });
		pauseForCamera();
		following = true;
		physicalSizes = false;
		selected = id;
		controller?.focus(id);
	}
	function chooseFromSettings(id: string) {
		choosePlanet(id);
		if (matchMedia('(max-width: 767px)').matches) {
			settings = false;
			settingsButton?.focus({ preventScroll: true });
		}
	}
	function seek(value: number) {
		manual();
		years = value;
		controller?.seek(value);
		if (frame === 'galactic' && selected === 'sun') camera('trail');
	}
	function step(index: number) {
		const lesson = orbitChapters[index];
		chapter = index;
		storyFinished = false;
		elapsed = 0;
		frame = lesson.frame;
		speedFactor = lesson.factor;
		selected = lesson.view === 'earth' || lesson.view === 'earth-journey' ? 'earth' : 'sun';
		trails = true;
		camera(lesson.view);
	}
	function toggleStory() {
		settings = false;
		if (story && !storyFinished) {
			storyPaused = !storyPaused;
			return;
		}
		story = true;
		trackEvent('orbit_story_start');
		storyPaused = false;
		step(0);
	}
	function keyboard(event: KeyboardEvent) {
		if (event.key === 'Escape' && settings) {
			settings = false;
			settingsButton?.focus();
		}
	}
	function dismissSettings(event: PointerEvent) {
		if (event.type !== 'pointerdown') {
			if (event.pointerId === dismissalPointer) {
				dismissalPointer = undefined;
				if (event.cancelable) event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (!settings || !settingsPanel || !event.isPrimary || event.button !== 0) return;
		const path = event.composedPath();
		// Exclude the trigger so its click can close the panel without reopening it.
		if (path.includes(settingsPanel) || path.includes(settingsButton)) return;
		const restoreFocus = settingsPanel.contains(document.activeElement);
		settings = false;
		if (restoreFocus) settingsButton?.focus({ preventScroll: true });
		// A background dismissal must not also select a planet or end the story.
		if (path.includes(host)) {
			dismissalPointer = event.pointerId;
			event.preventDefault();
			event.stopPropagation();
		}
	}
	function sceneKeys(event: KeyboardEvent) {
		if (event.target !== event.currentTarget || !ready) return;
		if (['ArrowLeft', 'ArrowRight', '+', '-', '='].includes(event.key)) {
			event.preventDefault();
			if (event.key === '+' || event.key === '=') controller?.zoom(0.85);
			else if (event.key === '-') controller?.zoom(1.18);
			else controller?.rotate(event.key === 'ArrowLeft' ? -1 : 1);
		}
	}
	onMount(() => {
		window.addEventListener('pointerdown', dismissSettings, true);
		window.addEventListener('pointerup', dismissSettings, true);
		window.addEventListener('pointercancel', dismissSettings, true);
		const layout = new ResizeObserver(frameScene);
		for (const element of [stage, heading, bottomUi]) layout.observe(element);
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = preference.matches;
		const motion = (event: MediaQueryListEvent) => {
			reducedMotion = event.matches;
		};
		preference.addEventListener('change', motion);
		void start();
		return () => {
			alive = false;
			window.removeEventListener('pointerdown', dismissSettings, true);
			window.removeEventListener('pointerup', dismissSettings, true);
			window.removeEventListener('pointercancel', dismissSettings, true);
			layout.disconnect();
			preference.removeEventListener('change', motion);
			controller?.dispose();
		};
	});
</script>

<svelte:window onkeydown={keyboard} />
<section
	class="orbit-stage"
	aria-label="3D 궤도 탐험기"
	data-testid="orbit-explorer"
	data-status={status}
	bind:this={stage}
>
	<div class="viewport" data-testid="orbit-viewport">
		<div class="webgl-host" bind:this={host}></div>
		{#if !ready}
			<div class="fallback"><OrbitFallback /></div>
			<div class="loading" role="status">
				{#if status === 'error'}<p>이 기기에서 3D 화면을 표시할 수 없습니다.</p>
					<button type="button" onclick={start}>다시 시도</button>
				{:else if status === 'loading'}<p>태양계에 들어가는 중…</p>{:else}<p>
						태양을 중심으로 본 공전
					</p>{/if}
				<noscript
					><p>
						JavaScript를 켜면 3D 장면이 바로 열립니다. 아래에서 도식과 자료를 읽을 수 있습니다.
					</p></noscript
				>
			</div>
		{/if}
	</div>
	<div class="stage-heading" bind:this={heading}>
		<p class="eyebrow">A2O · ORBIT EXPLORER</p>
		<h1>궤도 탐험</h1>
		<p class="view-caption">
			{!ready
				? '태양과 네 행성의 공전 도식'
				: following
					? `${selected === 'sun' ? '태양' : selectedPlanet?.name} 중심 시점`
					: selected !== 'sun'
						? selectedPlanet?.name
						: frame === 'galactic'
							? '태양과 함께, 은하를 가로지르다.'
							: '태양을 도는 여덟 개의 세계.'}
		</p>
	</div>
	<div class="stage-actions">
		<button
			class="icon-button"
			type="button"
			aria-label="설정"
			disabled={!ready}
			aria-expanded={settings}
			aria-controls="orbit-settings"
			bind:this={settingsButton}
			onclick={() => (settings = !settings)}
			><svg
				width="21"
				height="21"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6m8 4v6" /></svg
			></button
		>
	</div>
	{#if settings}
		<aside id="orbit-settings" class="settings" aria-label="탐험 설정" bind:this={settingsPanel}>
			<div class="settings-heading">
				<h2>탐험 설정</h2>
				<button
					type="button"
					class="icon-button"
					aria-label="설정 닫기"
					onclick={() => {
						settings = false;
						settingsButton?.focus();
					}}>×</button
				>
			</div>
			<label for="planet-select">가까이 보기</label><select
				id="planet-select"
				value={following ? selected : ''}
				onchange={(e) => chooseFromSettings(e.currentTarget.value)}
				><option value="" disabled>천체 선택</option><option value="sun">태양</option
				>{#each orbitPlanets as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select
			>
			<label for="time-speed">시간 배속</label><select id="time-speed" bind:value={yearsPerSecond}
				>{#each [0.03, 0.1, 0.5, 1] as speed (speed)}<option value={speed}
						>1년 ≈ {(1 / (speed * motionRate)).toLocaleString('ko-KR', {
							maximumFractionDigits: 1
						})}초</option
					>{/each}</select
			>
			<fieldset>
				<legend>태양의 이동</legend>
				<div class="mode-options">
					<button
						type="button"
						aria-pressed={speedFactor !== 1}
						onclick={() => mode(EMPHASIZED_SPEED)}>시각적 강조</button
					><button type="button" aria-pressed={speedFactor === 1} onclick={() => mode(1)}
						>실제 속도 비율</button
					>
				</div>
			</fieldset>
			<p class="setting-note">
				{speedFactor === 1
					? '약 230 km/s의 이동 성분을 그대로 적용합니다.'
					: '나선이 잘 보이도록 태양 이동 성분을 1/20로 줄입니다.'}
			</p>
			<div class="checks">
				<label><input type="checkbox" bind:checked={trails} />이동 궤적</label><label
					><input type="checkbox" bind:checked={orbits} />공전 궤도</label
				><label><input type="checkbox" bind:checked={labels} />이름</label>
			</div>
			<label for="orbit-time">모델 시각 · J2000 + {years.toFixed(1)}년</label><input
				id="orbit-time"
				type="range"
				min="0"
				max={MAX_ORBIT_YEARS}
				step="0.01"
				value={years}
				oninput={(e) => seek(Number(e.currentTarget.value))}
			/>
			<a
				class="model-link"
				href="#orbit-model"
				onclick={() => {
					settings = false;
				}}>과학적 근사와 이미지 출처 ↓</a
			>
		</aside>
	{/if}
	<button
		type="button"
		class="scene-keyboard"
		disabled={!ready}
		aria-label="3D 장면 조작"
		title="← → 회전 · + − 확대·축소 · Enter 기본 시점"
		onkeydown={sceneKeys}
		onclick={() => {
			if (story) {
				pauseForCamera();
				camera(currentChapter.view);
			} else changeView(frame);
		}}
	></button>
	<div class="bottom-ui" bind:this={bottomUi}>
		{#if story}<div class="story" aria-live="polite" bind:this={storyPanel}>
				<div class="story-count">
					<span>이야기 {chapter + 1} / {orbitChapters.length}</span>
					<div>
						<button
							type="button"
							aria-label="이전 이야기"
							disabled={chapter === 0}
							onclick={() => step(chapter - 1)}>←</button
						><button
							type="button"
							aria-label="다음 이야기"
							disabled={chapter === orbitChapters.length - 1}
							onclick={() => step(chapter + 1)}>→</button
						>
					</div>
				</div>
				<h2>{currentChapter.title}</h2>
				<p>{currentChapter.text}</p>
			</div>
		{:else}<p class="gesture-hint">드래그로 회전 · 스크롤 / 핀치로 확대</p>{/if}
		<nav class="dock" aria-label="궤도 보기">
			<button
				type="button"
				class="story-button"
				aria-pressed={storyPlaying}
				data-active={story}
				title={storyFinished
					? '스토리 처음부터 다시 보기'
					: story
						? storyPaused
							? '스토리 계속 진행'
							: '스토리 일시 중지'
						: '스토리 시작'}
				disabled={!ready}
				onclick={toggleStory}
				><svg class="story-icon" viewBox="0 0 12 12" aria-hidden="true"
					>{#if storyPlaying}<rect x="3" y="2" width="2" height="8" /><rect
							x="7"
							y="2"
							width="2"
							height="8"
						/>{:else}<polygon points="3,2 10,6 3,10" />{/if}</svg
				>스토리</button
			><button
				type="button"
				aria-pressed={!story && !following && frame === 'solar' && selected === 'sun'}
				disabled={!ready}
				onclick={() => changeView('solar')}>태양계</button
			><button
				type="button"
				aria-pressed={!story && !following && frame === 'galactic' && selected === 'sun'}
				disabled={!ready}
				onclick={() => changeView('galactic')}>은하 궤적</button
			>
		</nav>
		<p class="scale-note">
			{!ready
				? '태양 중심 2D 도식 · J2000 + 4년'
				: frame === 'galactic'
					? speedFactor === 1
						? '은하 기준 · 실제 속도 비율'
						: '은하 기준 · 태양 이동 1/20'
					: '태양 중심'}<span
				>{ready && physicalSizes
					? '실제 크기·거리 비례 · 지구 근접 시점'
					: '거리 비례 · 천체 크기 확대'}</span
			>
		</p>
	</div>
</section>

<style>
	.orbit-stage {
		position: relative;
		isolation: isolate;
		background: #07171e;
		color: #f4f6f2;
		height: calc(100svh - 81px);
		min-height: 300px;
		overflow: hidden;
	}
	.viewport,
	.webgl-host,
	.fallback {
		position: absolute;
		inset: 0;
	}
	.webgl-host :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
	.webgl-host :global(.orbit-labels) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.webgl-host :global(.orbit-labels button) {
		position: absolute;
		top: 0;
		left: 0;
		border: 0;
		padding: 6px 10px;
		min-height: 36px;
		background: transparent;
		font-size: 12px;
		white-space: nowrap;
		cursor: pointer;
		pointer-events: auto;
		border-radius: 4px;
		text-shadow: 0 1px 3px #000;
	}
	.webgl-host :global(.orbit-labels button[hidden]) {
		display: none;
	}
	.stage-heading {
		position: absolute;
		left: max(32px, calc((100% - 1376px) / 2));
		top: 30px;
		pointer-events: none;
	}
	.eyebrow {
		font: 11px/1.5 var(--font-mono);
		color: #b7c6c8;
		margin: 0 0 10px;
	}
	h1 {
		font-size: clamp(25px, 3vw, 36px);
		line-height: 1.3;
		margin: 0 0 8px;
		font-weight: 650;
	}
	.view-caption {
		margin: 0;
		color: #c2d2d5;
		font-size: 14px;
	}
	.stage-actions {
		position: absolute;
		right: 28px;
		top: 28px;
	}
	button {
		color: inherit;
		cursor: pointer;
		border: 1px solid #52666d;
		background: #102832;
		border-radius: 6px;
		min-height: 44px;
	}
	button:disabled {
		opacity: 0.42;
		cursor: default;
	}
	button:hover:not(:disabled) {
		background: #213b44;
	}
	button:active:not(:disabled) {
		transform: translateY(1px);
	}
	.icon-button {
		display: inline-grid;
		place-items: center;
		width: 44px;
		padding: 0;
		background: #102832d9;
	}
	.scene-keyboard {
		position: absolute;
		width: 1px;
		height: 1px;
		left: 32px;
		top: 150px;
		overflow: hidden;
		min-height: 0;
		padding: 0;
		border: 0;
		opacity: 0;
	}
	.scene-keyboard:focus-visible {
		opacity: 1;
		width: 100px;
		height: 44px;
		background: #102832;
		border-radius: 4px;
	}
	.scene-keyboard:focus-visible::after {
		content: '← →  + −';
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 14px;
	}
	.bottom-ui {
		position: absolute;
		bottom: 18px;
		left: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		flex-direction: column;
		pointer-events: none;
	}
	.bottom-ui button,
	.bottom-ui nav {
		pointer-events: auto;
	}
	.gesture-hint {
		color: #b9cacd;
		font-size: 12px;
		margin: 0 0 16px;
		text-shadow: 0 1px 5px #07171e;
	}
	.dock {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 100%;
		align-items: center;
		gap: 6px;
		background: #0b2029ed;
		padding: 8px;
		border: 1px solid #3a535d;
		border-radius: 12px;
		box-shadow: 0 8px 32px #0003;
	}
	.dock button {
		background: transparent;
		border-color: transparent;
		padding: 0 18px;
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
	}
	.dock button[aria-pressed='true'],
	.dock .story-button[data-active='true'] {
		color: #f4cb96;
		border-color: #a57e51;
		background: #342d24;
	}
	.dock .story-button {
		color: #f4cb96;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.story-icon {
		width: 12px;
		height: 12px;
		fill: currentColor;
		flex: none;
	}
	.scale-note {
		color: #b7c7ca;
		font-size: 11px;
		margin: 12px 0 0;
		display: flex;
		gap: 20px;
		text-shadow: 0 1px 4px #07171e;
	}
	.story {
		width: min(500px, 100%);
		margin-bottom: 20px;
		padding: 16px 22px 20px;
		background: #07171eb3;
		border-left: 2px solid #d6a16a;
		border-radius: 0 8px 8px 0;
		pointer-events: auto;
	}
	.story h2 {
		text-shadow: 0 1px 4px #07171e;
		font-size: 23px;
		line-height: 1.4;
		margin: 0 0 8px;
	}
	.story p {
		text-shadow: 0 1px 3px #07171e;
		font-size: 14px;
		line-height: 1.8;
		margin: 0;
		color: #d2dfe0;
	}
	.story-count {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #f2d3ae;
		font-size: 11px;
	}
	.story-count button {
		width: 44px;
		background: transparent;
		border: 0;
		font-size: 20px;
	}
	.settings {
		position: absolute;
		z-index: 5;
		top: 82px;
		right: 28px;
		width: min(340px, calc(100% - 40px));
		max-height: calc(100% - 102px);
		overflow-y: auto;
		background: #102832f5;
		border: 1px solid #52666d;
		border-radius: 12px;
		padding: 14px 22px 22px;
		box-shadow: 0 18px 60px #0006;
	}
	.settings-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.settings :is(button, select, input, a):focus-visible,
	.stage-actions button:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 1px #d6a16a;
	}
	.settings-heading h2 {
		font-size: 18px;
		margin: 0;
	}
	.settings-heading button {
		border: 0;
		font-size: 26px;
	}
	.settings > label,
	legend {
		display: block;
		color: #d8e1e1;
		font-size: 13px;
		margin: 18px 0 8px;
	}
	select {
		width: 100%;
		padding: 10px;
		background: #172f38;
		color: #f4f6f2;
		border: 1px solid #657c85;
		border-radius: 5px;
		min-height: 44px;
		font-size: 14px;
	}
	fieldset {
		padding: 0;
		border: 0;
		margin: 0;
		min-width: 0;
	}
	.mode-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}
	.mode-options button {
		padding: 7px;
		font-size: 12px;
	}
	.mode-options button[aria-pressed='true'] {
		border-color: #d6a16a;
		color: #f4cb96;
	}
	.setting-note {
		font-size: 12px;
		line-height: 1.7;
		color: #bbcdd0;
		margin: 9px 0 18px;
	}
	.checks {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		font-size: 12px;
		border-block: 1px solid #3a535d;
		padding-block: 8px;
	}
	.checks label {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-height: 40px;
	}
	input {
		accent-color: #d6a16a;
	}
	input[type='range'] {
		width: 100%;
		min-height: 32px;
	}
	.model-link {
		display: block;
		padding-top: 10px;
		min-height: 44px;
		color: #efc798;
		font-size: 12px;
	}
	.loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		background: #07171ecc;
		padding: 40px;
		text-align: center;
	}
	.loading p {
		color: #d5dedc;
		font-size: 15px;
	}
	.loading button {
		padding-inline: 20px;
	}
	@media (max-width: 767px) {
		.orbit-stage {
			height: calc(100svh - 65px);
			min-height: 300px;
		}
		.stage-heading {
			left: 20px;
			top: 24px;
		}
		.stage-actions {
			top: 22px;
			right: 20px;
		}
		.view-caption {
			font-size: 12px;
		}
		.settings {
			top: 78px;
			right: 20px;
			max-height: calc(100% - 96px);
		}
		.bottom-ui {
			left: 12px;
			right: 12px;
			bottom: 16px;
		}
		.dock {
			padding: 6px;
			gap: 2px;
		}
		.dock button {
			font-size: 13px;
			padding-inline: 12px;
		}
		.scale-note {
			flex-wrap: wrap;
			justify-content: center;
			gap: 4px 12px;
			font-size: 10px;
		}
		.gesture-hint {
			font-size: 11px;
			margin-bottom: 14px;
		}
		.story {
			padding: 10px 16px 16px;
			margin-bottom: 12px;
		}
		.story h2 {
			font-size: 20px;
		}
		.story p {
			font-size: 13px;
			line-height: 1.7;
		}
	}
	@media (max-width: 350px) {
		.dock button {
			padding-inline: 8px;
			font-size: 12px;
		}
	}
	@media (max-height: 600px) {
		.stage-heading {
			top: 18px;
		}
		.stage-heading h1 {
			font-size: 24px;
		}
		.eyebrow,
		.view-caption,
		.gesture-hint {
			display: none;
		}
		.bottom-ui {
			bottom: 10px;
		}
		.story {
			max-height: 150px;
			overflow-y: auto;
			pointer-events: auto;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
	@media (max-height: 600px) and (min-width: 600px) {
		.orbit-stage:has(.story) .stage-actions {
			right: min(370px, calc(42vw + 40px));
		}
		.story {
			position: absolute;
			right: 0;
			bottom: calc(100% + 12px);
			width: min(330px, 42vw);
			margin: 0;
		}
	}
</style>
