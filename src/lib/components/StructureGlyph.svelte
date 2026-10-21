<script lang="ts">
	let { id }: { id: string } = $props();
	const key = $props.id();
</script>

{#if id === 'iss'}
	<!-- Orthographic study of the eight main array wings and the transverse truss. -->
	<defs>
		<linearGradient id={`${key}-module`} x1="0" y1="0" x2="1" y2="0">
			<stop stop-color="#778E91" /><stop offset=".35" stop-color="#D8DFCE" /><stop
				offset="1"
				stop-color="#8EA3A1"
			/>
		</linearGradient>
	</defs>
	<path d="M1 35H99V39H1Z" fill="#536D77" />
	<g fill="none" stroke="#B3C7C2" stroke-width=".5">
		<path d="M1 35H99M1 39H99" />
		{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}<path
				d={`M${i * 5} 35l5 4v-4l-5 4`}
			/>{/each}
	</g>
	{#each [0, 15, 73, 88] as x (x)}
		<path d={`M${x + 6} 31V44`} stroke="#C3CBB9" stroke-width="1.4" />
		<g fill="#635F52" stroke="#CFAB72" stroke-width=".5">
			<path d={`M${x} 0h12v32h-12zM${x} 42h12v32h-12z`} />
			{#each [4, 8, 12, 16, 20, 24, 28, 46, 50, 54, 58, 62, 66, 70] as y (y)}<path
					d={`M${x} ${y}h12`}
					stroke-width=".3"
				/>{/each}
			<path
				d={`M${x + 3} 0v32m3 -32v32m3 -32v32M${x + 3} 42v32m3 -32v32m3 -32v32`}
				stroke-width=".25"
			/>
		</g>
	{/each}
	<g fill="#D2DBCC" stroke="#829B9B" stroke-width=".45">
		<path d="M31 18H42V31H31ZM59 17H69V31H59ZM58 44H69V59H58Z" />
		<path d="M34 20V29M38 20V29M62 19V29M66 19V29M61 46V57M65 46V57" fill="none" />
	</g>
	<g fill={`url(#${key}-module)`} stroke="#506B74" stroke-width=".45">
		<rect x="46" y="20" width="8" height="39" rx="3.5" />
		<rect x="33" y="41" width="33" height="7" rx="3" />
		<rect x="53" y="28" width="13" height="6" rx="2.5" />
		<ellipse cx="50" cy="20" rx="3" ry="2" />
		<path d="M47 26H53M47 33H53M47 50H53" fill="none" />
		<circle cx="50" cy="60" r="2.5" />
	</g>
	<path d="M43 37L39 26 44 21M53 51L61 62 67 60" fill="none" stroke="#DBCBA6" stroke-width=".8" />
{:else if id === 'tower'}
	<defs>
		<linearGradient id={`${key}-facade`} x1="0" y1="0" x2="1" y2="0">
			<stop stop-color="#587D87" /><stop offset=".35" stop-color="#C9D6CB" /><stop
				offset=".58"
				stop-color="#91B0B1"
			/><stop offset="1" stop-color="#4B7381" />
		</linearGradient>
		<clipPath id={`${key}-tower-clip`}
			><path d="M0 100C.4 64 2 32 5.9 4L8 0 8.8 17 10 .6 12.1 4C16 32 17.6 64 18 100Z" /></clipPath
		>
	</defs>
	<g clip-path={`url(#${key}-tower-clip)`}>
		<rect width="18" height="100" fill={`url(#${key}-facade)`} />
		<g fill="none" stroke="#D7DECF" stroke-width=".22" opacity=".65">
			{#each Array.from({ length: 39 }, (_, i) => 4 + i * 2.4) as y (y)}<path
					d={`M0 ${y}H18`}
				/>{/each}
			<path d="M3 100Q3 39 7 3M6 100Q6 40 8 5M9 100V18M12 100Q12 40 10 5M15 100Q15 40 11 3" />
		</g>
		<path d="M8 0L8.8 19 10 .6" fill="none" stroke="#264F60" stroke-width=".5" />
		<path d="M0 94H18" stroke="#4F7480" stroke-width=".8" />
	</g>
{/if}
