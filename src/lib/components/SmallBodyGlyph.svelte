<script lang="ts">
	let { id }: { id: string } = $props();
	const key = $props.id();
	const phobos =
		'M0 38C0 28 5 20 14 13C21 8 29 2 36 0C48 0 58 3 67 6C82 12 94 23 100 39C100 51 94 63 84 70C74 78 62 81.48 50 81.48C35 81 20 76 11 65C4 56 0 47 0 38Z';
	const vesta =
		'M0 48C0 34 9 20 21 12C31 5 43 0 55 2C68 3 82 13 91 25C97 35 100 43 100 53C100 70 86 87 72 94C59 100 43 100 30 95C18 90 10 80 5 68C2 61 0 55 0 48Z';
</script>

<defs>
	<radialGradient id={`${key}-rock`} cx="32%" cy="24%" r="90%">
		<stop stop-color="#C7C3AA" /><stop
			offset=".58"
			stop-color={id === 'phobos' ? '#A79881' : '#A8A99B'}
		/><stop offset="1" stop-color="#64756F" />
	</radialGradient>
	<radialGradient id={`${key}-basin`} cx="52%" cy="84%" r="32%">
		<stop stop-color="#D4D0B7" stop-opacity=".45" /><stop
			offset="1"
			stop-color="#D4D0B7"
			stop-opacity="0"
		/>
	</radialGradient>
	<clipPath id={`${key}-shape`}><path d={id === 'phobos' ? phobos : vesta} /></clipPath>
</defs>
<g clip-path={`url(#${key}-shape)`}>
	<path d={id === 'phobos' ? phobos : vesta} fill={`url(#${key}-rock)`} />
	{#if id === 'phobos'}
		<path
			d="M8 28C12 16 27 12 40 20C48 26 49 39 39 47C26 57 10 48 7 37Z"
			fill="#7F7D6D"
			stroke="#D3BDA0"
			stroke-width="1.1"
		/>
		<path d="M12 30C17 21 31 20 39 27C43 32 39 42 32 44C21 48 13 42 12 30Z" fill="#666F64" />
		<path d="M13 31Q21 21 32 24" fill="none" stroke="#B6A68B" stroke-width="1.3" />
		<g fill="none" stroke="#D0BE9D" stroke-width=".65" opacity=".6">
			<path
				d="M46 14Q61 19 81 35M48 21Q66 30 87 46M48 29Q66 41 84 57M44 41Q54 55 70 68M38 49Q46 63 58 72"
			/>
		</g>
	{:else}
		<!-- Southern basin is a broad relief change, not a cartoon mouth or exact topographic map. -->
		<path d={vesta} fill={`url(#${key}-basin)`} />
		<path
			d="M12 72Q22 76 30 83M72 84Q82 79 90 68M35 89Q47 93 58 92"
			fill="none"
			stroke="#D9D4BB"
			stroke-width=".8"
			opacity=".4"
		/>
		<path
			d="M28 78Q32 70 37 75M61 81Q68 72 77 74"
			fill="none"
			stroke="#7D8A7C"
			stroke-width=".7"
			opacity=".5"
		/>
	{/if}
	<g fill="#7E897B" stroke="#D0CAB0" stroke-width=".6" opacity=".8">
		{#each id === 'phobos' ? [[65, 22, 3], [82, 46, 4], [38, 65, 2], [61, 54, 2], [75, 35, 1.5]] : [[25, 31, 8], [61, 28, 5], [75, 48, 7], [40, 49, 4], [17, 57, 3], [51, 14, 2], [86, 62, 2]] as [x, y, r] (x)}
			<circle cx={x} cy={y} {r} />
			<path
				d={`M${x - r * 0.7} ${y}a${r * 0.7} ${r * 0.65} 0 0 1 ${r * 1.2} ${-r * 0.45}`}
				fill="none"
				stroke="#626F65"
			/>
		{/each}
	</g>
	{#each Array.from({ length: 22 }, (_, i) => i) as i (i)}
		<circle
			cx={10 + ((i * 23) % 82)}
			cy={8 + ((i * 17) % 66)}
			r={0.4 + (i % 3) * 0.3}
			fill="#E0D7BA"
			opacity=".35"
		/>
	{/each}
</g>
