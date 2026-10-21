<script lang="ts">
	import { orbitPlanets } from '$lib/data/orbits';
	import { eclipticPosition } from '$lib/utils/orbit-model';
	const inner = orbitPlanets
		.slice(0, 4)
		.map((planet) => ({ ...planet, position: eclipticPosition(planet, 4) }));
</script>

<svg
	viewBox="-240 -200 480 400"
	role="img"
	aria-label="안쪽 네 행성의 2D 공전 도식. J2000부터 4년 후의 황도면 투영. 궤도 거리는 선형 비례, 천체는 식별용 확대 표식입니다."
>
	<g stroke="#385461" stroke-width=".6" opacity=".65">
		<path d="M-220 0H220M0-180V180" />
	</g>
	{#each inner as planet (planet.id)}
		<ellipse
			cx={-planet.a[0] * planet.e[0] * 110}
			cy="0"
			rx={planet.a[0] * 110}
			ry={planet.a[0] * Math.sqrt(1 - planet.e[0] ** 2) * 110}
			transform={`rotate(${-planet.peri[0]})`}
			fill="none"
			stroke={planet.color}
			stroke-opacity=".45"
			stroke-width="1"
		/>
		<circle
			cx={planet.position[0] * 110}
			cy={-planet.position[1] * 110}
			r="4"
			fill={planet.color}
		/>
		<text x={planet.position[0] * 110 + 8} y={-planet.position[1] * 110 - 7} fill={planet.color}
			>{planet.name}</text
		>
	{/each}
	<circle r="9" fill="#E5B16B" />
	<text x="15" y="5" fill="#F2C68B">태양</text>
	<path d="M-210 168h110m-110-4v8m110-8v8" stroke="#C2D2D5" fill="none" />
	<text x="-155" y="190" fill="#C2D2D5" text-anchor="middle">1 AU</text>
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	text {
		font: 11px var(--font-sans);
	}
</style>
