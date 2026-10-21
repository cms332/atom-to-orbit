<script lang="ts">
	const key = $props.id();
	const spots = [
		[36, 65, 1.3, 0.9],
		[39, 64, 0.7, 0.55],
		[40, 67, 0.65, 0.4],
		[64, 43, 0.75, 0.55],
		[66, 44, 0.35, 0.3],
		[86, 59, 0.45, 0.7]
	];
</script>

<defs>
	<clipPath id={`${key}-disc`}><circle cx="50" cy="50" r="50" /></clipPath>
	<radialGradient id={`${key}-photosphere`} cx="50%" cy="50%" r="50%">
		<stop stop-color="#F4D392" /><stop offset=".48" stop-color="#EEC17B" /><stop
			offset=".78"
			stop-color="#DFA15D"
		/><stop offset=".94" stop-color="#C78042" /><stop offset="1" stop-color="#A95F34" />
	</radialGradient>
	<radialGradient id={`${key}-mottle`}>
		<stop stop-color="#A56135" stop-opacity=".25" /><stop
			offset="1"
			stop-color="#A56135"
			stop-opacity="0"
		/>
	</radialGradient>
	<pattern id={`${key}-grain`} width="5" height="5" patternUnits="userSpaceOnUse">
		<g fill="#FFF0BE" opacity=".25"
			><circle cx=".7" cy="1.1" r=".13" /><circle cx="3.2" cy=".6" r=".18" /><circle
				cx="2.2"
				cy="3.4"
				r=".15"
			/><circle cx="4.6" cy="4.3" r=".12" /></g
		>
		<g fill="#9D5B31" opacity=".18"
			><circle cx="1.5" cy="2.1" r=".13" /><circle cx="4.1" cy="2.8" r=".2" /><circle
				cx=".4"
				cy="4.5"
				r=".16"
			/></g
		>
	</pattern>
</defs>
<!-- HMI-inspired colour treatment and limb darkening. Surface marks are illustrative, not live data. -->
<g clip-path={`url(#${key}-disc)`}>
	<circle cx="50" cy="50" r="50" fill={`url(#${key}-photosphere)`} />
	{#each Array.from({ length: 110 }, (_, i) => i) as i (i)}
		{@const a = i * 2.399963}
		{@const r = 47 * Math.sqrt((i + 0.5) / 110)}
		<ellipse
			cx={50 + r * Math.cos(a)}
			cy={50 + r * Math.sin(a)}
			rx={1.5 + (i % 4) * 0.65}
			ry={1.1 + (i % 3) * 0.5}
			fill={`url(#${key}-mottle)`}
			opacity=".55"
		/>
	{/each}
	<circle cx="50" cy="50" r="50" fill={`url(#${key}-grain)`} />
	{#each spots as [x, y, rx, ry] (`${x}-${y}`)}
		<ellipse
			cx={x}
			cy={y}
			rx={rx * 1.9}
			ry={ry * 1.9}
			fill="#AA6F3D"
			opacity=".55"
			transform={`rotate(-22 ${x} ${y})`}
		/>
		<ellipse cx={x} cy={y} {rx} {ry} fill="#684A35" transform={`rotate(-22 ${x} ${y})`} />
	{/each}
	<g fill="#F7DDA0" opacity=".45"
		><ellipse cx="83" cy="35" rx=".3" ry="1.6" /><ellipse
			cx="85"
			cy="38"
			rx=".25"
			ry=".9"
		/><ellipse cx="20" cy="63" rx=".3" ry="1.1" /></g
	>
</g>
<circle cx="50" cy="50" r="49.8" fill="none" stroke="#F0BC77" stroke-width=".4" opacity=".45" />
