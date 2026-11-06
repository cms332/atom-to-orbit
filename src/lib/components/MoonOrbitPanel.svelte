<script lang="ts">
	let { turn, spinning = true }: { turn: number; spinning?: boolean } = $props();
	let angle = $derived(turn * 2 * Math.PI);
</script>

<svg
	viewBox="-105 -90 210 180"
	role="img"
	aria-label={spinning
		? '자전하는 달의 주황 표식은 언제나 지구를 향해요.'
		: '자전하지 않는 달의 주황 표식은 늘 왼쪽을 향해요.'}
>
	<circle r="65" fill="none" stroke="#73a1a7" stroke-dasharray="2 4" />
	<path d="M0 -70v9 M0 61v9 M-70 0h9 M61 0h9" stroke="#73a1a7" />
	<circle r="19" fill="#39828a" /><path
		d="M-13 -11q6 -9 16 -4l-5 7 4 5 -9 6 -6 -5z"
		fill="#91c5b6"
	/>
	<text y="34" text-anchor="middle" font-size="12" fill="currentColor">지구</text>
	<g
		transform={'translate(' +
			65 * Math.cos(angle) +
			' ' +
			-65 * Math.sin(angle) +
			') rotate(' +
			(spinning ? -360 * turn : 0) +
			')'}
		data-moon
	>
		<circle r="15" fill="#ebdbc5" /><circle cx="5" cy="-6" r="3.5" fill="#b4a38e" /><circle
			cx="6"
			cy="5"
			r="2"
			fill="#b4a38e"
		/><path d="M-14 0l8 -5v10z" fill="#a6400e" />
	</g>
</svg>
