<script lang="ts">
	import { earthLandPath } from '$lib/data/earth-outline';
	let { id }: { id: string } = $props();
	const key = $props.id();
</script>

<defs>
	<clipPath id={`${key}-disc`}><circle cx="50" cy="50" r="50" /></clipPath>
	<radialGradient id={`${key}-shade`} cx="35%" cy="30%" r="75%">
		<stop stop-color="#F0EAD4" stop-opacity=".16" /><stop
			offset=".5"
			stop-color="#102D38"
			stop-opacity="0"
		/><stop offset="1" stop-color="#102D38" stop-opacity=".38" />
	</radialGradient>
</defs>
<g clip-path={`url(#${key}-disc)`}>
	<circle cx="50" cy="50" r="50" />
	{#if id === 'earth'}
		<!-- Public-domain Natural Earth coastline, orthographic 20 E / 15 N. -->
		<path d={earthLandPath} fill="#9DBAA0" />
		<g fill="none" stroke="#E1E4D2" stroke-linecap="round" opacity=".55">
			<path
				d="M12 34Q27 22 41 25M69 27Q82 29 91 36M12 72Q24 79 36 78M64 74Q78 72 89 61"
				stroke-width="1.5"
			/>
			<path d="M18 37Q32 28 42 29M67 77Q79 76 85 68" stroke-width=".6" />
		</g>
	{:else if id === 'moon'}
		<!-- Near-side maria arranged from the NASA full-Moon reference; simplified contours. -->
		<g fill="#748882" opacity=".85">
			<path
				d="M12 30C17 20 24 19 29 25Q34 31 32 39Q30 44 33 49C35 55 29 61 23 59Q14 58 12 50C7 48 6 43 9 39Z"
			/>
			<path d="M23 22C27 12 44 10 53 18Q62 27 49 38Q42 40 35 38Q22 34 23 22Z" />
			<path d="M52 25Q62 17 70 25C77 34 69 42 61 41Q52 37 52 25Z" />
			<path d="M59 41Q69 35 76 43Q82 49 78 54Q77 59 71 60Q65 59 62 55Q53 54 53 49Q54 44 59 41Z" />
			<path
				d="M75 52Q87 48 92 59Q92 65 84 67Q77 67 75 64Q71 58 75 52ZM77 31Q84 27 90 33Q94 38 90 41Q85 46 81 43Q75 42 76 38Z"
			/>
			<path
				d="M33 54Q46 50 52 60Q54 67 48 70Q41 75 35 73Q28 73 28 65Q28 58 33 54ZM18 66Q27 60 32 70Q33 77 28 79Q21 82 18 77Q15 71 18 66Z"
			/>
			<ellipse cx="67" cy="65" rx="5" ry="4" />
		</g>
		<g fill="none" stroke="#D4D9C4" stroke-width=".65" opacity=".65">
			<circle cx="43" cy="82" r="2.5" /><circle cx="34" cy="47" r="2.2" /><circle
				cx="28"
				cy="56"
				r="1.5"
			/>
			<path d="M43 77L39 65M46 80L61 71M47 84L63 89M41 85L34 94M40 81L23 77" />
		</g>
		{#each [[55, 75, 2], [73, 78, 3], [59, 87, 2], [25, 88, 1.5], [83, 73, 2], [49, 48, 1.5], [55, 10, 1]] as [x, y, r] (`${x}-${y}`)}
			<circle cx={x} cy={y} {r} fill="none" stroke="#CDD2BE" stroke-width=".5" opacity=".6" />
		{/each}
	{:else if id === 'mercury'}
		<path
			d="M8 29Q20 12 39 15T63 23Q75 28 88 22L96 43Q78 54 68 46T43 43Q25 40 14 53Z"
			fill="#8F9A91"
			opacity=".5"
		/>
		<g fill="#87958C" stroke="#C9CCB8" stroke-width=".65">
			{#each [[27, 29, 8], [61, 24, 5], [72, 64, 8], [42, 74, 4], [48, 44, 2], [17, 59, 3], [53, 90, 3], [81, 35, 2], [32, 53, 1.5], [64, 44, 3]] as [x, y, r] (x)}
				<circle cx={x} cy={y} {r} /><path
					d={`M${x - r * 0.7} ${y}q${r * 0.3} ${-r} ${r * 1.3} ${-r * 0.4}`}
					fill="none"
					stroke="#697D75"
				/>
			{/each}
		</g>
		<path
			d="M70 59Q67 50 64 47M77 62L90 57M77 68L88 76M69 69Q65 79 62 81M66 62L56 59"
			fill="none"
			stroke="#D2D5C0"
			stroke-width=".6"
			opacity=".6"
		/>
		<circle cx="72" cy="64" r="2.5" fill="#D5D6C2" />
	{:else if id === 'venus'}
		<g fill="none" stroke-linecap="round">
			<path
				d="M-9 36Q29 2 68 15T111 5M-9 58Q29 19 65 31T110 21M-8 82Q22 45 63 49T111 38M-2 102Q33 65 72 68T115 55"
				stroke="#E2D6B5"
				stroke-width="9"
				opacity=".75"
			/>
			<path
				d="M-4 42Q28 12 58 22M-3 68Q36 34 72 39T105 30M8 89Q42 59 88 61"
				stroke="#A69B7D"
				stroke-width="1.4"
				opacity=".45"
			/>
			<path
				d="M9 33Q28 16 47 18M17 65Q46 44 75 49M34 81Q58 69 83 72"
				stroke="#F0E5CA"
				stroke-width="1.1"
				opacity=".65"
			/>
		</g>
	{:else if id === 'mars'}
		<path
			d="M24 18Q33 14 42 22L50 28Q57 27 63 36L66 49Q59 54 57 64L48 73 36 68Q31 57 23 56L18 45 21 33Z"
			fill="#856E5C"
			opacity=".7"
		/>
		<path d="M69 44Q82 35 91 47L88 61Q78 70 68 64L64 56Z" fill="#99725D" opacity=".7" />
		<path d="M37 5Q50 0 66 5L64 10 58 12 51 10 46 13 38 10Z" fill="#E0DCC7" />
		<path d="M39 8Q51 4 62 8" stroke="#BCC4AF" stroke-width=".7" fill="none" />
		<path d="M21 47Q30 51 38 48T54 54 67 52" fill="none" stroke="#725F51" stroke-width="1" />
		<ellipse cx="63" cy="77" rx="13" ry="8" fill="#CCA17E" opacity=".65" />
		<g fill="none" stroke="#D2A681" stroke-width=".55" opacity=".6"
			><circle cx="77" cy="28" r="3" /><circle cx="28" cy="79" r="2" /><circle
				cx="16"
				cy="67"
				r="2.5"
			/></g
		>
	{:else if id === 'neptune'}
		<path
			d="M-4 25Q45 32 104 24M-3 44Q49 53 104 43M0 73Q51 82 100 72"
			fill="none"
			stroke="#90B6BC"
			stroke-width="1.5"
			opacity=".4"
		/>
		<path
			d="M4 36Q49 44 97 34M8 85Q54 91 95 81"
			fill="none"
			stroke="#335F7C"
			stroke-width="2.5"
			opacity=".35"
		/>
		<ellipse cx="34" cy="56" rx="10" ry="4.5" fill="#315D7B" opacity=".65" />
		<path
			d="M40 50Q47 47 57 49M48 52L59 52M65 75L77 73"
			fill="none"
			stroke="#C9D9CF"
			stroke-width="1"
			stroke-linecap="round"
			opacity=".8"
		/>
	{:else if id === 'jupiter'}
		<circle cx="50" cy="50" r="50" fill="#C5B496" />
		<g fill="none">
			<path
				d="M-4 15Q42 8 104 15M-4 27Q24 20 48 25T104 25M-5 43Q22 36 44 42T105 42M-5 62Q24 70 52 64T105 62M-5 81Q50 93 105 79"
				stroke="#937C64"
				stroke-width="6"
			/>
			<path
				d="M-3 20Q50 14 103 20M-3 34Q28 29 50 34T103 33M-3 53Q45 59 104 51M-3 73Q50 84 103 72"
				stroke="#E1D2B0"
				stroke-width="4"
			/>
			<path
				d="M0 39Q17 33 29 38T53 39 79 38 103 37M-2 67Q15 73 29 68T55 70M-2 86Q46 97 102 85"
				stroke="#B69978"
				stroke-width="1.4"
			/>
			<path
				d="M2 46Q12 41 20 45T36 45 51 46M3 58Q23 62 39 60"
				stroke="#7F7565"
				stroke-width=".8"
				opacity=".7"
			/>
		</g>
		<ellipse cx="73" cy="67" rx="12" ry="7" fill="#C3A382" transform="rotate(-8 73 67)" />
		<ellipse cx="73" cy="67" rx="9" ry="5" fill="#B27F64" transform="rotate(-8 73 67)" />
		<path d="M66 67Q71 62 79 65M66 70Q73 73 79 68" stroke="#D0AB87" stroke-width=".8" fill="none" />
		<ellipse cx="34" cy="78" rx="3" ry="1.5" fill="#E1D6B8" />
	{/if}
	<circle cx="50" cy="50" r="50" fill={`url(#${key}-shade)`} />
</g>
