<script lang="ts">
	import { onMount } from 'svelte';
	import type { CreateTypes, Options } from 'canvas-confetti';

	let { onfinish }: { onfinish: () => void } = $props();
	let canvas: HTMLCanvasElement;
	const colors = ['#ff4778', '#ff923d', '#ffd43b', '#35c878', '#20c5db', '#497cff', '#b365ef'];

	onMount(() => {
		let cancelled = false;
		let cannon: CreateTypes | undefined;
		let secondBurst: ReturnType<typeof setTimeout> | undefined;
		let finish: ReturnType<typeof setTimeout> | undefined;

		// Load only after a correct answer; reset/navigation can cancel the pending import.
		void import('canvas-confetti')
			.then(({ default: confetti }) => {
				if (cancelled) return;
				cannon = confetti.create(canvas, {
					resize: true,
					useWorker: false,
					// Owner-requested exception for this short, answer-triggered celebration.
					disableForReducedMotion: false
				});
				const { width, height } = canvas.getBoundingClientRect();
				const compact = width < 480;
				const velocity = Math.min(42, 28 + height * 0.018);
				const base: Options = {
					colors,
					shapes: ['square', 'circle'],
					ticks: 170,
					gravity: 0.9,
					decay: 0.93,
					scalar: compact ? 1 : 1.15,
					flat: false
				};
				// Opposing paper bursts, then a smaller central accent: varied speed,
				// scale and spin inspired by Canvas Confetti's Realistic Look demo.
				for (const [x, angle] of [
					[0.16, 65],
					[0.84, 115]
				]) {
					void cannon({
						...base,
						particleCount: compact ? 44 : 60,
						origin: { x, y: 0.8 },
						angle,
						spread: 70,
						startVelocity: velocity
					});
				}
				secondBurst = setTimeout(() => {
					void cannon?.({
						...base,
						particleCount: compact ? 28 : 36,
						origin: { x: 0.5, y: 0.72 },
						spread: 110,
						startVelocity: velocity * 0.7,
						decay: 0.92,
						scalar: 0.8
					});
					void cannon?.({
						...base,
						particleCount: 12,
						shapes: ['star'],
						origin: { x: 0.5, y: 0.72 },
						spread: 90,
						startVelocity: velocity * 0.85,
						gravity: 0.75,
						scalar: 1.15
					});
				}, 180);
				finish = setTimeout(onfinish, 3400);
			})
			.catch(() => {
				// The answer remains usable even if this optional decoration cannot load.
				if (!cancelled) onfinish();
			});

		return () => {
			cancelled = true;
			clearTimeout(secondBurst);
			clearTimeout(finish);
			cannon?.reset();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true" data-testid="quiz-confetti"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		pointer-events: none;
	}
</style>
