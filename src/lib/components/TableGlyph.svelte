<script lang="ts">
	// One affine projection for the tabletop, frame, four vertical legs and their feet.
	// u = along the length, v = across the width, drop = distance below the tabletop.
	const point = (u: number, v: number, drop = 0) => ({
		x: 67 * u + 33 * v,
		y: 12 - 10 * u + 20 * v + drop
	});
	const path = (points: ReturnType<typeof point>[]) =>
		points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
	const legs = [
		[0.13, 0.12],
		[0.87, 0.12],
		[0.13, 0.88],
		[0.87, 0.88]
	];
</script>

<!-- Rear components first; the opaque top then hides the joints above its underside. -->
<g fill="none" stroke="#68898D" stroke-width="1.65" stroke-linejoin="round">
	<path d={path([point(0.13, 0.12, 13), point(0.87, 0.12, 13), point(0.87, 0.88, 13)])} />
	{#each legs as [u, v] (`${u}-${v}`)}
		<path d={path([point(u, v, 1), point(u, v, 18)])} />
	{/each}
</g>
<g fill="none" stroke="#AAC1B9" stroke-width="1.65" stroke-linejoin="round">
	<path d={path([point(0.13, 0.12, 13), point(0.13, 0.88, 13), point(0.87, 0.88, 13)])} />
	{#each [0.13, 0.87] as u (u)}
		<path d={path([point(u, 0.88, 1), point(u, 0.88, 18)])} />
	{/each}
</g>
<g stroke="#314D57" stroke-width="1.4" stroke-linecap="round">
	{#each legs as [u, v] (`${u}-${v}`)}
		{@const foot = point(u, v, 18)}<path d={`M${foot.x - 1} ${foot.y}h2`} />
	{/each}
</g>
<path
	d={path([
		point(0, 0),
		point(0, 1),
		point(1, 1),
		point(1, 1, 2.3),
		point(0, 1, 2.3),
		point(0, 0, 2.3)
	]) + 'Z'}
	fill="#294B55"
/>
<path d={path([point(0, 0), point(1, 0), point(1, 1), point(0, 1)]) + 'Z'} fill="#356C76" />
<path
	d={path([point(0.015, 0.025), point(0.985, 0.025), point(0.985, 0.975), point(0.015, 0.975)]) +
		'Z'}
	fill="none"
	stroke="#D4DFD1"
	stroke-width=".6"
	stroke-linejoin="round"
/>
<path
	d={path([point(0.015, 0.5), point(0.985, 0.5)])}
	fill="none"
	stroke="#D4DFD1"
	stroke-width=".5"
/>
<!-- The net shares the same plane and supports; no loose floating diagonals below it. -->
<path
	d={path([point(0.5, 0, -7), point(0.5, 1, -7), point(0.5, 1), point(0.5, 0)]) + 'Z'}
	fill="#C3D2C6"
	opacity=".22"
/>
<g fill="none" stroke="#D5DFCE" stroke-width=".25" opacity=".8">
	{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as i (i)}<path
			d={path([point(0.5, i / 8, -7), point(0.5, i / 8)])}
		/>{/each}
	{#each [2.3, 4.7] as lift (lift)}<path
			d={path([point(0.5, 0, -lift), point(0.5, 1, -lift)])}
		/>{/each}
</g>
<g fill="none" stroke="#D8E0D1" stroke-width=".7">
	<path d={path([point(0.5, 0, 1), point(0.5, 0, -7), point(0.5, 1, -7), point(0.5, 1, 1)])} />
</g>
