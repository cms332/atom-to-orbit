<script lang="ts">
	import ScaleScene from './ScaleScene.svelte';
	import LogAxis from './LogAxis.svelte';
	import { objects, qualifications, sourceById, type ScaleObject } from '$lib/data/science';
	import {
		MAX_EXPONENT,
		MIN_EXPONENT,
		objectLength,
		nearestObject,
		scientific
	} from '$lib/utils/scales';
	import { DEFAULT_EXPONENT } from '$lib/utils/navigation-state';
	import { playbackFrame, playbackPlan } from '$lib/utils/scale-playback';
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	let {
		compact = false,
		exponent = $bindable(DEFAULT_EXPONENT),
		onSelectionChange
	}: {
		compact?: boolean;
		exponent?: number;
		onSelectionChange?: (exponent: number, mode: 'push' | 'replace') => void;
	} = $props();
	let selected = $derived(nearestObject(objects, exponent));
	let selectedIndex = $derived(objects.findIndex((o) => o.id === selected.id));
	let source = $derived(sourceById(selected.sourceId));
	let ready = $state(false);
	let playing = $state(false);
	let animationFrame = 0;
	let resumeFrom: number | null = null;
	function stopPlayback(sync = false, resumable = false) {
		cancelAnimationFrame(animationFrame);
		resumeFrom = resumable && playing ? exponent : null;
		playing = false;
		if (sync) onSelectionChange?.(exponent, 'replace');
	}
	function togglePlayback() {
		if (playing) {
			stopPlayback(true, true);
			return;
		}
		const from =
			resumeFrom !== null && Math.abs(resumeFrom - exponent) < 0.01 && exponent < MAX_EXPONENT
				? exponent
				: MIN_EXPONENT;
		const plan = playbackPlan(
			from,
			objects.map((object) => Math.log10(object.meters)),
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
		exponent = from;
		playing = true;
		resumeFrom = null;
		const started = performance.now();
		function tick(now: number) {
			if (!playing) return;
			const frame = playbackFrame(plan, now - started);
			exponent = frame.exponent;
			if (frame.done) stopPlayback(true);
			else animationFrame = requestAnimationFrame(tick);
		}
		animationFrame = requestAnimationFrame(tick);
	}
	beforeNavigate(() => {
		if (playing) stopPlayback();
	});
	onMount(() => {
		ready = true;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const hidden = () => {
			if (document.hidden && playing) stopPlayback(true, true);
		};
		const motionChanged = () => {
			if (playing) stopPlayback(true, true);
		};
		document.addEventListener('visibilitychange', hidden);
		motion.addEventListener('change', motionChanged);
		return () => {
			cancelAnimationFrame(animationFrame);
			document.removeEventListener('visibilitychange', hidden);
			motion.removeEventListener('change', motionChanged);
		};
	});
	function select(id: string) {
		stopPlayback();
		const object = objects.find((o) => o.id === id);
		if (object) {
			exponent = Math.log10(object.meters);
			onSelectionChange?.(exponent, 'push');
		}
	}
	function move(direction: number) {
		const object = objects[selectedIndex + direction];
		if (object) select(object.id);
	}
	function moveCursor(event: KeyboardEvent) {
		const changes: Record<string, number> = {
			ArrowLeft: -0.01,
			ArrowDown: -0.01,
			ArrowRight: 0.01,
			ArrowUp: 0.01,
			PageDown: -1,
			PageUp: 1
		};
		if (event.key !== 'Home' && event.key !== 'End' && !(event.key in changes)) return;
		event.preventDefault();
		stopPlayback();
		exponent =
			event.key === 'Home'
				? MIN_EXPONENT
				: event.key === 'End'
					? MAX_EXPONENT
					: Math.max(
							MIN_EXPONENT,
							Math.min(MAX_EXPONENT, Number((exponent + changes[event.key]).toFixed(12)))
						);
		onSelectionChange?.(exponent, 'replace');
	}
</script>

{#snippet playbackControl()}
	<button
		type="button"
		class="playback-button"
		disabled={!ready}
		onclick={togglePlayback}
		aria-controls={compact ? 'home-range' : 'scale-range'}
		onkeydown={(event) => {
			if (event.key === 'Escape' && playing) stopPlayback(true, true);
		}}
	>
		<span class="playback-icon" class:paused={playing} aria-hidden="true"></span>
		{playing ? '일시 정지' : '자동 재생'}
	</button>
{/snippet}

{#snippet objectLabel(object: ScaleObject)}
	<span class="small-label">{object.nameEn}</span>
	<h2>{object.nameKo}</h2>
{/snippet}

{#snippet objectValue(object: ScaleObject, reserve = false)}
	<span class="small-label">{object.measurement} · {qualifications[object.approximation]}</span>
	<strong data-testid={reserve ? undefined : 'selected-value'}>{scientific(object.meters)}</strong>
	<span class="converted"
		>{object.approximation === 'standard'
			? '규격'
			: object.approximation === 'maximum'
				? '최대 약'
				: object.approximation === 'nominal'
					? '명목'
					: '약'}
		{objectLength(object)}</span
	>
{/snippet}

{#snippet readout()}
	<div class="readout" aria-live="polite" aria-atomic="true">
		<div>
			<div class="readout-content">{@render objectLabel(selected)}</div>
			{#each objects as object (object.id)}<div class="readout-reserve" aria-hidden="true">
					{@render objectLabel(object)}
				</div>{/each}
		</div>
		<div class="value">
			<div class="readout-content">{@render objectValue(selected)}</div>
			{#each objects as object (object.id)}<div class="readout-reserve" aria-hidden="true">
					{@render objectValue(object, true)}
				</div>{/each}
		</div>
	</div>
{/snippet}

<div class="explorer" class:full={!compact}>
	{#if !compact}<div class="mobile-selection">
			<label for="object-picker">탐험할 대상</label><select
				id="object-picker"
				name="object"
				autocomplete="off"
				value={selected.id}
				onchange={(event) => select(event.currentTarget.value)}
				>{#each objects as object (object.id)}<option value={object.id}
						>{object.nameKo} · {objectLength(object)}</option
					>{/each}</select
			>
		</div>{/if}
	<section class="instrument" class:compact aria-label="로그 스케일 탐험기">
		<div class="instrument-top">
			<span>SCALE EXPLORER</span><span class="copper">SI · METER</span>
		</div>
		{#if !compact}{@render readout()}{/if}
		<div class="visual-context">
			<div class="geometry"><ScaleScene {exponent} controls={playbackControl} /></div>
			{#if !compact}<div class="object-context">
					<div class="context-content">
						<p>{selected.briefKo}</p>
						<span class="derivation">환산: {selected.derivation}</span>
					</div>
					{#each objects as object (object.id)}<div class="context-reserve" aria-hidden="true">
							<p>{object.briefKo}</p>
							<span class="derivation">환산: {object.derivation}</span>
						</div>{/each}
				</div>{/if}
		</div>
		{#if compact}{@render readout()}{/if}
		<div class="axis-heading">
			<label for={compact ? 'home-range' : 'scale-range'}>로그 눈금 탐색</label><span
				>한 눈금 = 길이 10배</span
			>
		</div>
		<LogAxis {exponent} />
		<input
			id={compact ? 'home-range' : 'scale-range'}
			name="at"
			type="range"
			min={MIN_EXPONENT}
			max={MAX_EXPONENT}
			step="any"
			bind:value={exponent}
			onkeydown={moveCursor}
			onpointerdown={() => stopPlayback()}
			oninput={(event) => {
				stopPlayback();
				exponent = Number(event.currentTarget.value);
				onSelectionChange?.(exponent, 'replace');
			}}
			aria-valuetext={`눈금 10의 ${exponent.toFixed(2)}제곱 m, 가장 가까운 대상: ${selected.nameKo}, ${selected.measurement}, ${objectLength(selected)}`}
		/>
		{#if !compact}<div class="object-stepper">
				<button
					class="pressable"
					type="button"
					onclick={() => move(-1)}
					disabled={selectedIndex === 0}><span aria-hidden="true">←</span> 이전 대상</button
				><span>{selectedIndex + 1} / {objects.length}</span><button
					type="button"
					class="pressable"
					onclick={() => move(1)}
					disabled={selectedIndex === objects.length - 1}
					>다음 대상 <span aria-hidden="true">→</span></button
				>
			</div>{/if}
		<div class="instrument-links">
			<div class="source-slot">
				<a class="source-link" href={source.url}>{source.label} <span aria-hidden="true">↗</span></a
				>{#each objects as object (object.id)}<span
						class="source-link source-reserve"
						aria-hidden="true">{sourceById(object.sourceId).label} ↗</span
					>{/each}
			</div>
			{#if !compact && selected.articleSlug}<a
					class="source-link"
					href={`/articles/${selected.articleSlug}/`}
					>관련 이야기 읽기 <span aria-hidden="true">↗</span></a
				>{/if}
		</div>
	</section>
	{#if !compact}<aside class="object-panel" aria-label="탐험 대상 선택">
			<h2>무엇을 살펴볼까요?</h2>
			<p class="selection-hint">대상을 고르면 정확한 위치로 이동합니다.</p>
			<div class="object-list">
				{#each objects as object (object.id)}<button
						type="button"
						aria-pressed={selected.id === object.id}
						onclick={() => select(object.id)}
						><span class="object-name"
							>{#if selected.id === object.id}<span class="selection-mark" aria-hidden="true"
									>✓</span
								>{/if}{object.nameKo}</span
						><span class="object-number">{objectLength(object)}</span></button
					>{/each}
			</div>
			<a class="all-data-link" href="#data-title"
				>모든 수치와 출처 확인 <span aria-hidden="true">↓</span></a
			>
			<p class="list-note">
				각 대상의 굵기·지름·길이·높이를 비교합니다.<br />천체 사이의 거리는 포함하지 않습니다.
			</p>
		</aside>{/if}
</div>

<style>
	.explorer {
		min-width: 0;
	}
	.full {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.8fr);
		gap: 40px;
		align-items: start;
	}
	.mobile-selection {
		display: none;
	}
	.instrument {
		color: var(--on-deep);
		background: var(--deep);
		padding: 28px;
		border-radius: 18px;
		border: 1px solid #31525c;
		overflow: hidden;
	}
	.instrument-top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 12px;
		font: 600 11px var(--font-sans);
		letter-spacing: 0.04em;
		color: var(--on-deep-muted);
	}
	.copper {
		color: #e6bb82;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: end;
		gap: 18px;
		margin: 28px 0 18px;
	}
	.small-label {
		display: block;
		font-size: 12px;
		color: var(--on-deep-muted);
		margin-bottom: 9px;
		line-height: 1.5;
	}
	.readout h2 {
		font-size: 30px;
		line-height: 1.3;
		margin: 0;
		max-width: 230px;
	}
	.full .readout h2 {
		max-width: none;
	}
	.value {
		text-align: right;
		min-width: 0;
	}
	.value strong {
		font: 500 clamp(24px, 2.5vw, 36px)/1.3 var(--font-mono);
		color: #e6bb82;
		font-variant-numeric: tabular-nums;
	}
	.converted {
		display: block;
		font-size: 14px;
		color: var(--on-deep-muted);
		margin-top: 8px;
	}
	.visual-context {
		display: grid;
		grid-template-columns: 1fr;
		gap: 25px;
		align-items: center;
		padding-bottom: 24px;
		border-bottom: 1px solid #42606a;
		margin-bottom: 24px;
	}
	.geometry {
		height: auto;
		position: relative;
	}
	.object-context p {
		font-size: 15px;
		color: var(--on-deep-muted);
		line-height: 1.85;
		margin: 0 0 12px;
	}
	.derivation {
		font: 11px/1.8 var(--font-mono);
		color: var(--on-deep-muted);
		overflow-wrap: anywhere;
	}
	.instrument-links {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0 20px;
		border-top: 1px solid #42606a;
		margin-top: 18px;
	}
	.instrument-links .source-link {
		border: 0;
		margin-top: 0;
	}
	.axis-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
	}
	.axis-heading label {
		font-size: 14px;
		font-weight: 650;
	}
	.axis-heading > span {
		font-size: 12px;
		color: var(--on-deep-muted);
	}
	input {
		display: block;
		width: 100%;
		min-height: 44px;
		margin: 0;
		cursor: pointer;
		background: transparent;
		appearance: none;
		-webkit-appearance: none;
	}
	input::-webkit-slider-runnable-track {
		height: 5px;
		background: #789496;
		border-radius: 8px;
	}
	input::-moz-range-track {
		height: 5px;
		background: #789496;
		border-radius: 8px;
	}
	input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #e6bb82;
		border: 3px solid var(--deep);
		box-shadow: 0 0 0 1px #e6bb82;
		margin-top: -8.5px;
	}
	input::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #e6bb82;
		border: 3px solid var(--deep);
		box-shadow: 0 0 0 1px #e6bb82;
	}
	.playback-button {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		min-height: 48px;
		max-width: 100%;
		padding: 10px 12px;
		border: 1px solid transparent;
		border-radius: 0;
		background: transparent;
		color: var(--on-deep);
		font: 650 17px/1.35 var(--font-sans);
		text-shadow: 0 1px 3px var(--deep);
		cursor: pointer;
		outline-offset: 1px;
	}
	.playback-button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.playback-button:active {
		color: #e6bb82;
	}
	.playback-icon {
		width: 14px;
		height: 16px;
		flex-shrink: 0;
		display: inline-block;
		filter: drop-shadow(0 1px 2px var(--deep));
		position: relative;
	}
	.playback-icon::before {
		content: '';
		position: absolute;
		top: 1px;
		left: 1px;
		border-left: 12px solid currentColor;
		border-top: 7px solid transparent;
		border-bottom: 7px solid transparent;
	}
	.playback-icon.paused::before {
		top: 0;
		left: 0;
		width: 14px;
		height: 16px;
		border: 0;
		background: linear-gradient(
			to right,
			currentColor 0 4px,
			transparent 4px 10px,
			currentColor 10px
		);
	}
	.object-stepper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		margin-top: 22px;
	}
	.object-stepper button {
		min-height: 44px;
		border: 1px solid #6b878e;
		border-radius: 6px;
		background: transparent;
		color: var(--on-deep);
		padding: 9px 16px;
		font-size: 13px;
		cursor: pointer;
	}
	.object-stepper button:active:not(:disabled) {
		background: #42656c;
	}
	.object-stepper button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.object-stepper > span {
		font: 12px var(--font-mono);
		color: var(--on-deep-muted);
	}
	.source-link {
		display: block;
		min-height: 44px;
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px solid #42606a;
		color: var(--on-deep-muted);
		font-size: 12px;
		text-underline-offset: 4px;
	}
	.source-link:focus-visible {
		color: white;
	}
	.object-panel {
		padding-top: 7px;
	}
	.object-panel h2 {
		font-size: 26px;
		margin: 13px 0 10px;
	}
	.selection-hint {
		font-size: 14px;
		margin: 0 0 23px;
	}
	.object-list {
		border-top: 1px solid var(--line);
		max-height: 680px;
		overflow-y: auto;
		scrollbar-color: #8ca5a7 transparent;
		scrollbar-width: thin;
	}
	.object-list button {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 68px;
		text-align: left;
		border: 0;
		border-bottom: 1px solid var(--line);
		padding: 14px 16px;
		width: 100%;
		background: none;
		color: var(--ink);
		font-size: 16px;
		cursor: pointer;
	}
	.object-list button:active {
		background: #d7e6e1;
	}
	.object-list button[aria-pressed='true'] {
		background: var(--soft-teal);
		box-shadow: inset 3px 0 var(--teal);
		font-weight: 700;
	}
	.object-name {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.selection-mark {
		color: var(--teal);
	}
	.object-number {
		font: 12px var(--font-mono);
		color: var(--muted);
		white-space: nowrap;
	}
	.all-data-link {
		display: flex;
		justify-content: space-between;
		padding: 20px 0;
		min-height: 44px;
		color: var(--teal);
		font-size: 14px;
		text-decoration: none;
	}
	.list-note {
		font-size: 13px;
		border-top: 1px solid var(--line);
		padding-top: 17px;
	}
	@media (hover: hover) and (pointer: fine) {
		.playback-button:hover:not(:disabled) {
			color: #e6bb82;
		}
		.object-stepper button:hover:not(:disabled) {
			background: #31535d;
		}
		.object-stepper button:active:not(:disabled) {
			background: #42656c;
		}
		.source-link:hover {
			color: white;
		}
		.object-list button:hover {
			background: var(--soft-teal);
		}
		.object-list button:active {
			background: #d7e6e1;
		}
	}
	.compact {
		padding: 25px 28px 20px;
	}
	.compact .visual-context {
		display: block;
		border: 0;
		padding: 0;
		margin: 4px 0 14px;
	}
	.compact .geometry {
		height: auto;
	}
	.compact .readout {
		margin: 26px 0 20px;
	}
	/* Reserve all catalogue labels at the reader's current font size. */
	.readout > div {
		display: grid;
	}
	.readout-content,
	.readout-reserve {
		grid-area: 1 / 1;
		align-self: end;
	}
	.readout-reserve {
		visibility: hidden;
		pointer-events: none;
	}
	.object-context,
	.source-slot {
		display: grid;
		min-width: 0;
	}
	.context-content,
	.context-reserve,
	.source-slot > * {
		grid-area: 1/1;
	}
	.context-reserve,
	.source-reserve {
		visibility: hidden;
		pointer-events: none;
	}
	.compact .readout h2 {
		font-size: 25px;
		max-width: none;
	}
	.compact .value strong {
		font-size: 27px;
	}
	.compact .source-link {
		margin-top: 16px;
	}
	.compact .axis-heading label {
		font-size: 13px;
	}
	@media (max-width: 1100px) {
		.full {
			grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.8fr);
			gap: 28px;
		}
		.visual-context {
			grid-template-columns: 1fr;
			gap: 28px;
		}
		.full .geometry {
			height: auto;
		}
		.object-context p {
			font-size: 16px;
		}
	}
	@media (max-width: 900px) {
		.full {
			display: flex;
			flex-direction: column;
			gap: 18px;
		}
		.full .instrument {
			width: 100%;
		}
		.object-panel {
			display: none;
		}
		.mobile-selection {
			display: grid;
			gap: 9px;
			width: 100%;
		}
		.mobile-selection label {
			font-size: 14px;
			font-weight: 650;
		}
		.mobile-selection select {
			min-height: 52px;
			width: 100%;
			padding: 12px;
			color: var(--ink);
			background: var(--surface);
			border: 1px solid #9bb2b5;
			border-radius: 6px;
			font-size: 16px;
		}
		.mobile-selection select:focus {
			outline: none;
		}
		.mobile-selection select:focus-visible {
			border-color: var(--teal);
		}
		.full .geometry {
			height: auto;
		}
		.full .readout {
			margin-top: 24px;
		}
	}
	@media (max-width: 600px) {
		.full .readout h2 {
			font-size: clamp(23px, 6.92vw, 27px);
		}
		.instrument {
			padding: 22px 18px;
			border-radius: 14px;
		}
		.instrument-top {
			font-size: 11px;
		}
		.readout {
			gap: 18px;
		}
		.readout h2 {
			font-size: 27px;
		}
		.value strong {
			font-size: 28px;
		}
		.value {
			text-align: left;
		}
		.visual-context {
			grid-template-columns: 1fr;
			gap: 29px;
		}
		.full .geometry {
			height: auto;
		}
		.object-context p {
			font-size: 16px;
		}
		.derivation {
			font-size: 12px;
		}
		.axis-heading {
			align-items: start;
			flex-wrap: wrap;
		}
		.object-stepper {
			gap: 10px;
		}
		.object-stepper button {
			padding-inline: 13px;
		}
		.compact {
			padding: 23px 18px 18px;
		}
		.compact .geometry {
			height: auto;
		}
		.compact .readout {
			margin-top: 30px;
		}
		.compact .readout h2 {
			font-size: 24px;
		}
		.compact .value strong {
			font-size: 24px;
		}
		.compact .value {
			text-align: right;
		}
		.compact .small-label {
			font-size: 12px;
		}
		.compact .axis-heading > span {
			font-size: 11px;
		}
	}
	@media (max-width: 767px) {
		.full .readout {
			flex-direction: column;
			align-items: start;
			margin-top: 12px;
		}
		.full .value {
			text-align: left;
		}
		.full .readout-reserve,
		.full .context-reserve {
			display: none;
		}
		.full .visual-context {
			padding-bottom: 12px;
			margin-bottom: 16px;
		}
	}
</style>
