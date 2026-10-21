<script lang="ts">
	let { id }: { id: string } = $props();
	const key = $props.id();
</script>

{#if id === 'dna'}
	<!-- A schematic double helix, not an atomistic molecular model. -->
	<g fill="none" stroke-linecap="round">
		<path d="M0 96C45 96 45 4 90 4S135 96 180 96H190" stroke="#708F90" stroke-width="8" />
		<path d="M0 4C45 4 45 96 90 96S135 4 180 4H190" stroke="#967B61" stroke-width="8" />
		{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}
			{@const x = 4 + i * 9.5}
			{@const y = 50 + 46 * Math.cos((x * Math.PI) / 90)}
			<path d={`M${x} ${y}V50`} stroke="#A9CCC4" stroke-width="2.4" />
			<path d={`M${x} 50V${100 - y}`} stroke="#CBA579" stroke-width="2.4" />
		{/each}
		<path
			d="M0 96C22.5 96 33.75 73 45 50M90 4C112.5 4 123.75 27 135 50M180 96H190"
			stroke="#B9D5CD"
			stroke-width="8"
		/>
		<path
			d="M45 50C56.25 73 67.5 96 90 96M135 50C146.25 27 157.5 4 180 4H190"
			stroke="#D5AE7D"
			stroke-width="8"
		/>
		<path
			d="M2 94C21 94 32 73 43 51M92 6C111 6 122 27 133 49"
			stroke="#E0E5CE"
			stroke-width="1.2"
			opacity=".6"
		/>
	</g>
{:else if id === 'virus'}
	<defs>
		<radialGradient id={`${key}-envelope`} cx="35%" cy="30%" r="75%">
			<stop stop-color="#B6BA9D" /><stop offset=".65" stop-color="#85998B" /><stop
				offset="1"
				stop-color="#526F6C"
			/>
		</radialGradient>
	</defs>
	<circle cx="50" cy="50" r="42" fill={`url(#${key}-envelope)`} />
	<g fill="#D7C6A4" stroke="#D7C6A4" stroke-width="1.4" stroke-linecap="round">
		{#each Array.from({ length: 36 }, (_, i) => i) as i (i)}
			<g transform={`rotate(${i * 10} 50 50)`}>
				<path d="M50 9L49.5 3" fill="none" />
				<ellipse cx="49.5" cy="2" rx="1.9" ry="1.3" stroke="none" />
			</g>
		{/each}
	</g>
	<!-- Surface projections only; the intact envelope does not expose fictional RNA strands. -->
	{#each Array.from({ length: 30 }, (_, i) => i) as i (i)}
		{@const angle = i * 2.399963}
		{@const radius = 36 * Math.sqrt((i + 0.5) / 30)}
		<ellipse
			cx={50 + radius * Math.cos(angle)}
			cy={50 + radius * Math.sin(angle)}
			rx="1.8"
			ry="1.4"
			fill="#D4C7A7"
			opacity={0.35 + (i % 3) * 0.12}
		/>
	{/each}
	<path d="M18 34A35 35 0 0 1 49 15" fill="none" stroke="#D1D0AF" stroke-width="1" opacity=".6" />
{:else if id === 'red-cell'}
	<defs>
		<radialGradient id={`${key}-cell`} cx="46%" cy="42%" r="60%">
			<stop stop-color="#9E625C" /><stop offset=".34" stop-color="#AC7065" /><stop
				offset=".56"
				stop-color="#D69B85"
			/><stop offset=".74" stop-color="#C38B78" /><stop offset="1" stop-color="#855751" />
		</radialGradient>
	</defs>
	<ellipse cx="50" cy="41" rx="50" ry="41" fill={`url(#${key}-cell)`} />
	<path
		d="M7 29C16 9 41 2 65 10M13 62C33 80 65 77 86 59"
		fill="none"
		stroke="#E7B198"
		stroke-width="2"
		stroke-linecap="round"
		opacity=".7"
	/>
{:else if id === 'hair'}
	<defs>
		<linearGradient id={`${key}-shaft`} x1="0" y1="0" x2="0" y2="1">
			<stop stop-color="#6A6051" /><stop offset=".22" stop-color="#AD9979" /><stop
				offset=".45"
				stop-color="#C6B08B"
			/><stop offset=".72" stop-color="#A28C6C" /><stop offset="1" stop-color="#625B4E" />
		</linearGradient>
		<clipPath id={`${key}-shaft-clip`}><rect width="250" height="100" /></clipPath>
	</defs>
	<g clip-path={`url(#${key}-shaft-clip)`}>
		<rect width="250" height="100" fill={`url(#${key}-shaft)`} />
		<g fill="none" stroke="#E0C9A0" stroke-width=".9" opacity=".65">
			{#each Array.from({ length: 9 }, (_, i) => i) as i (i)}
				{@const x = i * 34 - 12}
				<path d={`M${x} -3q-8 10 1 17l-4 7 7 7-4 9 8 8-3 9 8 7-3 8 7 7-3 9 3 18`} />
				<path d={`M${x + 3} 28q17 -6 33 0m-26 33q16 -5 33 0m-29 25q18 -4 34 0`} opacity=".55" />
			{/each}
		</g>
		<path d="M0 30Q120 23 250 29" fill="none" stroke="#E7D3AE" stroke-width="3" opacity=".15" />
	</g>
{/if}
