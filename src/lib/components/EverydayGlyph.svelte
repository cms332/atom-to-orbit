<script lang="ts">
	let { id }: { id: string } = $props();
	const key = $props.id();
</script>

{#if id === 'battery'}
	<defs>
		<linearGradient id={`${key}-cylinder`} x1="0" y1="0" x2="0" y2="1">
			<stop stop-color="#819590" />
			<stop offset=".25" stop-color="#E0E3D5" />
			<stop offset=".48" stop-color="#B8C5BE" />
			<stop offset="1" stop-color="#758D88" />
		</linearGradient>
		<linearGradient id={`${key}-cap`} x1="0" y1="0" x2="1" y2="0">
			<stop stop-color="#5D777B" /><stop offset=".5" stop-color="#C8D3C8" /><stop
				offset="1"
				stop-color="#6D8586"
			/>
		</linearGradient>
	</defs>
	<!-- Full length includes the positive terminal; diameter remains 100. -->
	<path
		d="M10 0H328.28A10 50 0 0 1 328.28 100H10A10 50 0 0 1 10 0"
		fill={`url(#${key}-cylinder)`}
	/>
	<path d="M228 1H328.28A10 49 0 0 1 328.28 99H228Z" fill="#294C57" opacity=".88" />
	<ellipse cx="328.28" cy="50" rx="10" ry="49" fill={`url(#${key}-cap)`} />
	<path d="M331 32H345.28A2.995862 18 0 0 1 345.28 68H331Z" fill="#D9DFCF" />
	<ellipse cx="345.28" cy="50" rx="2.995862" ry="18" fill="#A5B7AE" />
	<ellipse cx="10" cy="50" rx="9" ry="49" fill="#94A8A0" />
	<path d="M21 19H317M21 84H317" stroke="#EBEBDD" stroke-width="1" opacity=".45" />
	<path d="M281 36V64M267 50H295M29 50H49" fill="none" stroke="#DCE3D5" stroke-width="2.4" />
	<text
		x="137"
		y="62"
		text-anchor="middle"
		fill="#294B55"
		font-size="32"
		font-family="system-ui,sans-serif">AA</text
	>
{:else if id === 'coin'}
	<defs>
		<linearGradient id={`${key}-metal`} x1="0" y1="0" x2="1" y2="1">
			<stop stop-color="#E0DDC7" /><stop offset=".45" stop-color="#B9BCA8" /><stop
				offset="1"
				stop-color="#838F87"
			/>
		</linearGradient>
	</defs>
	<circle cx="50" cy="50" r="50" fill={`url(#${key}-metal)`} />
	<circle cx="50" cy="50" r="47.5" fill="none" stroke="#E8E4CD" stroke-width="1" />
	<circle cx="50" cy="50" r="44.5" fill="none" stroke="#7E8D83" stroke-width=".65" />
	<!-- Denomination study, not a facsimile of a particular mint year. -->
	<text
		x="50.5"
		y="61.5"
		text-anchor="middle"
		fill="#7C8A80"
		font-size="35"
		font-weight="600"
		font-family="system-ui,sans-serif">100</text
	>
	<text
		x="50"
		y="60.5"
		text-anchor="middle"
		fill="#EAE5CE"
		font-size="35"
		font-weight="600"
		font-family="system-ui,sans-serif">100</text
	>
	<text
		x="50"
		y="77"
		text-anchor="middle"
		fill="#E1DFCA"
		font-size="7.5"
		font-family="system-ui,sans-serif">한국은행</text
	>
{/if}
