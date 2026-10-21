<script lang="ts">
	const key = $props.id();
	const body =
		'M0 18C2 14 10 11 21 9C37 5 53 7 66 10L72 11Q74 10 74.5 7Q76 8 75.5 12C82 14 88 17 92 18Q95 15 99 14L97 19L100 25Q95 24 92 21C80 21 70 22 59 24C42 27 22 29 9 25Q1 23 0 18Z';
</script>

<defs>
	<linearGradient id={`${key}-body`} x1="0" y1="0" x2="0" y2="1">
		<stop stop-color="#96B5BC" /><stop offset=".48" stop-color="#6C939F" /><stop
			offset="1"
			stop-color="#456D7A"
		/>
	</linearGradient>
	<clipPath id={`${key}-clip`}><path d={body} /></clipPath>
</defs>
<path d={body} fill={`url(#${key}-body)`} />
<g clip-path={`url(#${key}-clip)`}>
	<path d="M0 19Q16 25 34 21C49 21 61 22 74 20Q60 30 23 29L1 26Z" fill="#A4BBB9" opacity=".55" />
	<g fill="none" stroke="#426673" stroke-width=".35" opacity=".8">
		<path d="M1 20Q14 26 36 22M2 21Q15 28 39 23M4 23Q18 29 41 24M9 25Q23 29 43 25" />
	</g>
	<g fill="#D1DCCF" opacity=".27">
		{#each Array.from({ length: 40 }, (_, i) => i) as i (i)}
			<ellipse
				cx={15 + ((i * 19) % 65)}
				cy={8 + ((i * 7) % 17)}
				rx={0.5 + (i % 3) * 0.4}
				ry=".45"
			/>
		{/each}
	</g>
</g>
<path d="M31 21C33 24 35 28 41 32C35 32 30 28 27 23Z" fill="#70939A" />
<path d="M30 23Q33 27 38 30" stroke="#B9CDCA" stroke-width=".4" fill="none" />
<path d="M1 18C8 20 16 20 24 18" stroke="#355B68" stroke-width=".55" fill="none" />
<circle cx="23" cy="17.5" r=".55" fill="#173B49" />
<path d="M21 16.5q2 -1 3 0M19 9l3 -.4" fill="none" stroke="#BAD0CA" stroke-width=".35" />
