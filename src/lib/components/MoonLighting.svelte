<div class="lights">
	{#each [true, false] as full (full)}
		<figure>
			<strong>{full ? '보름달 무렵' : '새달 무렵'}</strong>
			<svg
				viewBox="0 0 240 108"
				role="img"
				aria-label={full
					? '왼쪽 햇빛이 지구를 향한 달 앞면을 비춰요.'
					: '왼쪽 햇빛이 지구 반대쪽인 달 뒷면을 비춰요.'}
			>
				<text x="8" y="22">햇빛 →</text><path
					d="M9 34h45l-6 -4m6 4 -6 4"
					fill="none"
					stroke="#b27739"
				/>
				<g transform={'translate(' + (full ? 95 : 190) + ' 72)'}
					><circle r="18" fill="#337981" /><text y="5" text-anchor="middle" fill="white">지구</text
					></g
				>
				<g transform={'translate(' + (full ? 186 : 83) + ' 48)'}
					><circle r="21" fill="#33434a" /><path
						d="M0 -21a21 21 0 0 0 0 42z"
						fill="#efc685"
					/><circle cx={full ? -15 : 15} cy="4" r="3.6" fill="#cd612c" stroke="white" /><text
						y="40"
						text-anchor="middle">달</text
					></g
				>
			</svg>
			<figcaption>{full ? '앞면은 대부분 낮이에요.' : '뒷면은 대부분 낮이에요.'}</figcaption>
		</figure>{/each}
</div>
<p>주황 점은 지구를 보는 앞면에 붙어 있어요. 노란 부분은 햇빛을 받는 곳이에요.</p>

<style>
	.lights {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
		gap: 12px;
	}
	.lights figure {
		margin: 0;
		border-radius: 8px;
		padding: 14px;
		background: var(--soft-teal);
	}
	svg {
		display: block;
		width: 100%;
		font-size: 13px;
	}
	figcaption {
		font-size: 14px;
	}
</style>
