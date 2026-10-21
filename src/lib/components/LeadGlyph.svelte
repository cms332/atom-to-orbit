<script lang="ts">
	const key = $props.id();
</script>

<defs>
	<linearGradient id={`${key}-graphite`} x1="0" y1="0" x2="0" y2="1">
		<stop stop-color="#424B4E" /><stop offset=".28" stop-color="#7B8480" /><stop
			offset=".55"
			stop-color="#5A6564"
		/><stop offset="1" stop-color="#303D43" />
	</linearGradient>
	<linearGradient id={`${key}-cut`} x1="0" y1="0" x2="1" y2="0">
		<stop stop-color="#59625F" /><stop offset="1" stop-color="#434D4D" />
	</linearGradient>
	<clipPath id={`${key}-body`}><path d="M7 0H233A7 50 0 0 1 233 100H7A7 50 0 0 1 7 0Z" /></clipPath>
	<clipPath id={`${key}-end`}><ellipse cx="7" cy="50" rx="7" ry="50" /></clipPath>
</defs>
<!-- Solid graphite fragment, not a hollow tube. Its measured thickness is still 100. -->
<g clip-path={`url(#${key}-body)`}>
	<path d="M7 0H233A7 50 0 0 1 233 100H7Z" fill={`url(#${key}-graphite)`} />
	<g fill="none" stroke="#A1AAA0" stroke-width=".45" opacity=".22">
		<path
			d="M15 22Q67 20 116 22T232 21M18 36Q89 34 156 36T236 35M14 68Q75 65 128 68T236 67M21 82Q100 80 165 82T236 81"
		/>
	</g>
	<ellipse cx="7" cy="50" rx="7" ry="50" fill={`url(#${key}-cut)`} />
	<g clip-path={`url(#${key}-end)`} fill="#B6BCAC" opacity=".25">
		{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}
			<ellipse cx={1 + ((i * 7) % 12)} cy={7 + ((i * 17) % 87)} rx=".35" ry=".85" />
		{/each}
	</g>
	<path d="M6 3A7 47 0 0 0 6 97" fill="none" stroke="#9DA79D" stroke-width=".55" opacity=".45" />
</g>
