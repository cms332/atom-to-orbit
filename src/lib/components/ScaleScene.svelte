<script lang="ts">
	import type { Snippet } from 'svelte';
	import { objects } from '$lib/data/science';
	import { cameraSlot, scaleArt } from '$lib/data/scale-art';
	import { converted } from '$lib/utils/scales';
	import {
		circleSurface,
		sceneReference,
		sceneLength,
		REFERENCE_PIXELS,
		REFERENCE_WIDTH_RATIO,
		SCENE_PADDING,
		SCENE_HEADROOM
	} from '$lib/utils/scale-scene';
	import ScaleGlyph from './ScaleGlyph.svelte';
	import SunGlow from './SunGlow.svelte';
	let { exponent, controls }: { exponent: number; controls?: Snippet } = $props();
	let measuredWidth = $state(520);
	let width = $derived(Math.max(200, measuredWidth));
	let referencePixels = $derived(sceneReference(width));
	let headroom = $derived(controls ? SCENE_HEADROOM : 0);
	let height = $derived(referencePixels + SCENE_PADDING + headroom);
	let baseline = $derived(referencePixels + 40 + headroom);
	let scale = $derived(referencePixels / 10 ** exponent);
	let slot = $derived(cameraSlot(objects, exponent));
	let gap = $derived(Math.min(220, width / 2.4));
	let bodies = $derived(
		objects
			.map((object, index) => ({
				...object,
				art: scaleArt[object.id],
				size: sceneLength(object.meters, exponent, referencePixels),
				x: width / 2 + (index - slot) * gap
			}))
			.reverse()
	);
</script>

<div
	class="scale-scene"
	bind:clientWidth={measuredWidth}
	style:--reference-limit={`${REFERENCE_PIXELS}px`}
	style:--reference-width-ratio={REFERENCE_WIDTH_RATIO}
	style:--scene-padding={`${SCENE_PADDING}px`}
	style:--scene-headroom={`${headroom}px`}
>
	<div class="scene-viewport">
		{#if controls}<div class="scene-controls">{@render controls()}</div>{/if}
		<svg
			viewBox={`0 0 ${width} ${height}`}
			role="img"
			aria-label={`같은 축척으로 비교하는 굵기·지름·길이·높이. 시야 너비 ${converted(width / scale)}.`}
			data-testid="scale-scene"
			data-reference-pixels={referencePixels}
			data-headroom={headroom}
		>
			{#each bodies as body (body.id)}
				{#if body.size >= 0.15 && body.size < width * 6}
					{@const drawnWidth = (body.size * body.art.width) / 100}
					{@const drawnHeight = (body.size * body.art.height) / 100}
					{#if body.id === 'sun'}
						<g
							data-testid="sun-glow"
							pointer-events="none"
							aria-hidden="true"
							opacity={Math.min(1, ((referencePixels * 1.8) / body.size) ** 3) *
								Math.max(0, Math.min(1, (width * 6 - body.size) / (width * 3)))}
							transform={`translate(${body.x - body.size / 2} ${baseline - body.size}) scale(${body.size / 100})`}
						>
							<SunGlow />
						</g>
					{/if}
					<g
						data-object={body.id}
						data-length={body.size}
						data-meters={body.meters}
						data-measure-axis={body.art.axis}
						fill={body.art.color}
						opacity={Math.min(1, ((referencePixels * 1.8) / body.size) ** 3) *
							Math.max(0, Math.min(1, (width * 6 - body.size) / (width * 3)))}
						aria-hidden="true"
					>
						{#if body.art.round && body.size > width * 5 && body.size / 2 > Math.max(Math.abs(body.x), Math.abs(width - body.x))}
							<path d={circleSurface(body.size / 2, body.x, baseline, width)} />
						{:else}
							<svg
								x={body.x - drawnWidth / 2}
								y={baseline - drawnHeight}
								width={drawnWidth}
								height={drawnHeight}
								viewBox={`0 0 ${body.art.width} ${body.art.height}`}
								overflow={body.art.allowOverflow ? 'visible' : 'hidden'}
							>
								<ScaleGlyph id={body.id} />
							</svg>
							{#if body.art.axis === 'y'}
								<path
									data-testid="measurement-guide"
									d={`M${body.x - drawnWidth / 2 - 5} ${baseline - drawnHeight}v${body.size}m-3 0h6m-6 ${-body.size}h6`}
									fill="none"
									stroke="#E6BB82"
									stroke-width=".8"
								/>
							{/if}
						{/if}
					</g>
				{/if}
			{/each}
			<g fill="none" stroke="#C2D2D5" stroke-width="1" aria-hidden="true">
				<path
					d={`M12 ${height - 24}H${12 + referencePixels}M12 ${height - 28}V${height - 20}M${12 + referencePixels} ${height - 28}V${height - 20}`}
				/>
			</g>
			<text
				x={20 + referencePixels}
				y={height - 20}
				fill="#C2D2D5"
				font-size="10"
				aria-hidden="true">{converted(Number((10 ** exponent).toPrecision(3)))}</text
			>
		</svg>
	</div>
	<div class="scene-caption">
		<span>표시한 치수 · 같은 축척</span><span
			>시야 약 {converted(Number((width / scale).toPrecision(3)))}</span
		>
	</div>
</div>

<style>
	.scale-scene {
		min-width: 0;
		container-type: inline-size;
	}
	.scene-viewport {
		position: relative;
	}
	.scene-viewport > svg {
		width: 100%;
		height: calc(
			min(var(--reference-limit), 100cqw / var(--reference-width-ratio)) + var(--scene-padding) +
				var(--scene-headroom)
		);
		display: block;
		overflow: hidden;
	}
	.scene-controls {
		position: absolute;
		/* Include the owner's 2px optical correction relative to the heading. */
		left: -12px;
		top: 8px;
		max-width: calc(100% - 16px);
		z-index: 1;
	}
	text {
		font-family: var(--font-mono);
	}
	.scene-caption {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 12px;
		color: var(--on-deep-muted);
		font-size: 11px;
		line-height: 20px;
	}
	@media (max-width: 600px) {
		.scene-caption {
			font-size: 10px;
			gap: 6px;
		}
	}
</style>
