<script lang="ts">
	const id = $props.id();
</script>

<svg
	viewBox="0 0 440 200"
	role="img"
	aria-label="푸른 낮하늘과 지평선이 따뜻하게 물든 저녁 하늘. 같은 육지 풍경을 비교한 설명용 그림입니다."
>
	<defs
		><linearGradient id={`${id}-sky`} x2="0" y2="1"
			><stop stop-color="#3e7290" /><stop offset=".45" stop-color="#a3c5cc" /><stop
				offset="1"
				stop-color="#e4aa78"
			/></linearGradient
		></defs
	>
	<path d="M0 0H440V200H0Z" fill={`url(#${id}-sky)`} />
	<circle cx="93" cy="44" r="15" fill="#f8edc9" /><circle cx="340" cy="132" r="15" fill="#f3cb93" />
	<path d="M220 15V174" stroke="#f2f4e7" stroke-opacity=".6" stroke-dasharray="3 6" />
	<path d="M0 160Q60 143 130 161T220 156Q280 143 350 161T440 156V200H0Z" fill="#60776a" />
	<path d="M40 181V157H89V181M260 181V157H309V181" fill="none" stroke="#e4e9cd" stroke-width="2" />
</svg>
