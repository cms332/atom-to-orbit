<script lang="ts">
	import { rayGeometry, sampleDirectBeam } from '$lib/data/sky-colors';
	let { elevation = 70, emphasis = '' }: { elevation?: number; emphasis?: string } = $props();
	const id = $props.id();
	const ray = $derived(rayGeometry(elevation));
	const bands = $derived(sampleDirectBeam(elevation).bands);
	const air = 'M20 294 A1290 1290 0 0 1 620 182 L620 272 A1200 1200 0 0 0 20 394 Z';
</script>

<svg
	viewBox="0 110 640 230"
	role="img"
	aria-labelledby={`${id}-title ${id}-desc`}
	data-testid="sky-rays"
>
	<title id={`${id}-title`}>공기에서 흩어진 빛과 곧장 통과한 빛</title>
	<desc id={`${id}-desc`}
		>태양 높이 {elevation}도. 1번은 공기에서 방향을 바꿔 눈에 도착하는 빛입니다. 2번은 공기를 통과해
		흰 면에 닿는 빛입니다. 점선은 파란 계열, 짧은 점선은 초록 계열, 실선은 빨간 계열입니다. 길이와
		크기는 실제 비례가 아닙니다.</desc
	>
	<defs>
		<marker
			id={`${id}-blue`}
			viewBox="0 0 10 10"
			refX="8"
			refY="5"
			markerWidth="6"
			markerHeight="6"
			orient="auto-start-reverse"
			><path d="M0 0L10 5L0 10" fill="none" stroke="#82c7ed" stroke-width="1.5" /></marker
		>
	</defs>
	<path d={air} fill="#163c47" stroke="#6b9caa" stroke-width="1" data-testid="air-layer" />
	<path d="M20 394 A1200 1200 0 0 1 620 272 L640 340H0Z" fill="#2a4442" />
	<circle cx={ray.sun.x} cy={ray.sun.y} r="14" fill="#f1d9ac" />
	{#each bands as band, index (band.id)}
		<g
			transform={`translate(${(index - 1) * 6 * Math.sin((elevation * Math.PI) / 180)},${-(index - 1) * 6 * Math.cos((elevation * Math.PI) / 180)})`}
		>
			<line
				x1={ray.sun.x}
				y1={ray.sun.y}
				x2={ray.scatter.x}
				y2={ray.scatter.y}
				stroke={band.color}
				stroke-width={emphasis === 'direct' || emphasis === 'all' ? 5 : 3}
				stroke-dasharray={band.dash}
			/>
			<line
				data-band={band.id}
				data-transmission={band.transmission}
				x1={ray.scatter.x}
				y1={ray.scatter.y}
				x2={ray.target.x}
				y2={ray.target.y}
				stroke={band.color}
				stroke-width={1 + band.transmission * (emphasis === 'direct' || emphasis === 'all' ? 6 : 4)}
				stroke-dasharray={band.dash}
			/>
		</g>
	{/each}
	<!-- Scattered paths start in air. Their strengths are qualitative, not 1−T sky radiance. -->
	<path
		data-testid="scattered-ray"
		d={`M${ray.scatter.x} ${ray.scatter.y} L260 282`}
		stroke="#82c7ed"
		stroke-width={emphasis === 'scattered' || emphasis === 'all' ? 6 : 3}
		stroke-dasharray="9 4"
		fill="none"
		marker-end={`url(#${id}-blue)`}
	/>
	<path
		d={`M${ray.scatter.x} ${ray.scatter.y} l-50 -38 M${ray.scatter.x} ${ray.scatter.y} l38 -35`}
		stroke="#82c7ed"
		stroke-width="2"
		stroke-dasharray="9 4"
		fill="none"
	/>
	<path
		d={`M${ray.scatter.x + 5} ${ray.scatter.y + 4} L266 286 M${ray.scatter.x + 5} ${ray.scatter.y + 4} l-60 5`}
		stroke="#efa77f"
		stroke-width="1.3"
		fill="none"
	/>
	<circle
		cx={ray.scatter.x}
		cy={ray.scatter.y}
		r="7"
		fill="#e4efed"
		stroke="#0d2a33"
		stroke-width="2"
	/>
	<g stroke="#d5e6e3" fill="none" stroke-width="2">
		<path d="M243 282Q260 263 277 282Q260 299 243 282Z" /><circle cx="260" cy="282" r="5" />
	</g>
	<text x="260" y="325" text-anchor="middle" font-size="24" fill="#eaf2f0">1</text>
	<path d="M530 270H570L580 282H520Z" fill="#f6f7f3" stroke="#a7c4c7" />
	<text x="550" y="312" text-anchor="middle" font-size="24" fill="#eaf2f0">2</text>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
