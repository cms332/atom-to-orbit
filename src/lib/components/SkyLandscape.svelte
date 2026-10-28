<script lang="ts">
	let { elevation = 70 }: { elevation?: number } = $props();
	const id = $props.id();
	// An editorial illustration, independent of the three-band transmission calculation.
	const warmth = $derived(Math.max(0, Math.min(1, (35 - elevation) / 30)));
	const sunY = $derived(170 - ((elevation - 5) / 75) * 140);
</script>

<svg viewBox="0 0 640 240" role="img" aria-labelledby={`${id}-title`} data-testid="sky-landscape">
	<title id={`${id}-title`}
		>같은 운동장 위의 {elevation <= 15
			? '노을빛 하늘. 위쪽에는 푸른빛이 남아 있습니다.'
			: '푸른 하늘.'} 실제 날씨 예측이 아닌 설명용 풍경입니다.</title
	>
	<defs>
		<linearGradient id={`${id}-day`} x2="0" y2="1"
			><stop stop-color="#518ca7" /><stop offset="1" stop-color="#d3e7df" /></linearGradient
		>
		<linearGradient id={`${id}-evening`} x2="0" y2="1"
			><stop stop-color="#315e7c" /><stop offset=".42" stop-color="#7c9cac" /><stop
				offset="1"
				stop-color="#e8ad79"
			/></linearGradient
		>
	</defs>
	<path d="M0 0H640V240H0Z" fill={`url(#${id}-day)`} />
	<path d="M0 0H640V240H0Z" fill={`url(#${id}-evening)`} opacity={warmth} />
	<circle cx={110 + (elevation - 5) * 1.5} cy={sunY} r="13" fill="#fff0c4" />
	<path d="M405 81q6-18 27-11q12-25 35-10q21-3 28 21Z" fill="#e4e9df" />
	<path d="M405 81q6-18 27-11q12-25 35-10q21-3 28 21Z" fill="#edbf98" opacity={warmth} />
	<path d="M0 186Q115 165 260 187T640 181V240H0Z" fill="#526d60" />
	<path d="M0 208Q160 183 320 201T640 198V240H0Z" fill="#78836a" />
	<path
		d="M70 207V177H145V207M70 177L86 187H161V214M145 177L161 187M86 187V214"
		fill="none"
		stroke="#dde4ca"
		stroke-width="2"
	/>
	<path d="M510 196V146" stroke="#324d46" stroke-width="6" />
	<path d="M477 155Q469 129 495 127Q505 103 525 124Q550 126 539 153Z" fill="#355e51" />
	<path d="M205 226Q360 202 481 226" fill="none" stroke="#c7c7a5" stroke-width="1.5" />
</svg>

<style>
	svg {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 5px;
	}
</style>
