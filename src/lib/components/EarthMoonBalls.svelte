<script lang="ts">
	import { onMount } from 'svelte';
	import {
		MODEL_EARTH_DIAMETER,
		MODEL_MOON_DIAMETER,
		MODEL_CENTER_DISTANCE
	} from '$lib/data/earth-moon-comparison';
	let ready = $state(false);
	let selected = $state<number | null>(null);
	const options = [
		{ distance: 1, label: '1m' },
		{ distance: 3, label: '3m' },
		{ distance: MODEL_CENTER_DISTANCE, label: `약 ${MODEL_CENTER_DISTANCE.toFixed(1)}m` }
	];
	const correct = $derived(selected === MODEL_CENTER_DISTANCE);
	const ratio = MODEL_MOON_DIAMETER / MODEL_EARTH_DIAMETER;
	const factor = 800 / MODEL_CENTER_DISTANCE;
	onMount(() => {
		ready = true;
	});
</script>

<figure class="earth-moon-balls" aria-labelledby="balls-title">
	<h3 id="balls-title">농구공 지구, 테니스공 달</h3>
	<p class="setup">지구를 농구공만큼 줄이면 달은 테니스공 정도가 돼요.</p>
	<div class="ball-pair">
		<div class="ball">
			<svg viewBox="0 0 160 130" role="img" aria-labelledby="basketball-title">
				<title id="basketball-title">지름 24cm의 농구공으로 줄인 지구</title>
				<circle data-ball="earth" cx="80" cy="65" r="51" fill="#dca16c" />
				<path
					d="M29 65h102 M80 14v102 M47 26q50 39 0 78 M113 26q-50 39 0 78"
					fill="none"
					stroke="#5a4436"
					stroke-width="1.5"
				/>
			</svg>
			<h4>지구</h4>
			<p>지름 <strong>24cm</strong></p>
		</div>
		<div class="ball">
			<svg viewBox="0 0 160 130" role="img" aria-labelledby="tennis-title">
				<title id="tennis-title">같은 비율로 줄이면 지름 약 6.5cm가 되는 테니스공 크기의 달</title>
				<circle data-ball="moon" cx="80" cy="65" r={51 * ratio} fill="#d3ddaa" />
				<path
					d={`M${80 - 51 * ratio * 0.55} ${65 - 51 * ratio * 0.83}q${51 * ratio * 0.9} ${51 * ratio * 0.83} 0 ${51 * ratio * 1.66}`}
					fill="none"
					stroke="#627446"
					stroke-width="1"
				/>
			</svg>
			<h4>달</h4>
			<p>지름 약 <strong>{(MODEL_MOON_DIAMETER * 100).toFixed(1)}cm</strong></p>
		</div>
	</div>
	<p class="pair-note">크기만 비교한 그림이에요. 두 공 사이의 간격은 실제 비례가 아니에요.</p>
	<fieldset>
		<legend>달이 된 테니스공은 어디에 놓아야 할까요?</legend>
		<p class="question-note">농구공의 한가운데에서 테니스공의 한가운데까지 재어 보세요.</p>
		<div class="choices">
			{#each options as option (option.distance)}
				<button
					disabled={!ready}
					aria-pressed={selected === option.distance}
					onclick={() => {
						selected = option.distance;
					}}>{option.label}</button
				>
			{/each}
		</div>
	</fieldset>
	<p class="answer" role="status">
		{#if selected === null}
			보기 하나를 골라 두 공 사이의 거리를 확인해 보세요.
		{:else if correct}
			맞았어요! 두 공은 약 {MODEL_CENTER_DISTANCE.toFixed(1)}m 떨어져 있어야 해요. 아래 그림은
			크기와 거리를 같은 비율로 줄인 모습이에요.
		{:else}
			{selected}m는 너무 가까워요. 공의 크기뿐 아니라 거리도 같은 비율로 줄여야 해요. 조금 더 먼
			곳을 골라 보세요.
		{/if}
	</p>
	<div class="solution" hidden={!correct}>
		<p class="distance">약 <strong>{MODEL_CENTER_DISTANCE.toFixed(1)}<span>m</span></strong></p>
		<p class="solution-note">두 공의 한가운데끼리 잰 거리</p>
		<div class="end-labels"><span>농구공 지구</span><span>테니스공 달</span></div>
		<svg
			class="scaled-balls"
			viewBox="0 0 900 130"
			role="img"
			aria-labelledby="scaled-balls-title scaled-balls-desc"
		>
			<title id="scaled-balls-title">공 모형의 크기와 거리를 같은 비율로 줄인 그림</title>
			<desc id="scaled-balls-desc"
				>지름 24cm의 농구공 지구와 지름 약 6.5cm의 테니스공 달. 두 중심 사이는 약 {MODEL_CENTER_DISTANCE.toFixed(
					2
				)}m입니다. 거리를 한 화면에 담으면 두 공이 이렇게 작아져요.</desc
			>
			<path d="M50 45H850 M50 70v15H850V70" fill="none" stroke="#8aaeb2" />
			<circle
				data-scaled-ball="earth"
				cx="50"
				cy="45"
				r={(MODEL_EARTH_DIAMETER * factor) / 2}
				fill="#efba8e"
			/>
			<circle
				data-scaled-ball="moon"
				cx="850"
				cy="45"
				r={(MODEL_MOON_DIAMETER * factor) / 2}
				fill="#d3ddaa"
			/>
		</svg>
		<p class="solution-note">거리를 한 화면에 담으면 두 공이 이렇게 작아져요.</p>
	</div>
	<noscript
		><p class="no-script-answer">
			정답은 약 {MODEL_CENTER_DISTANCE.toFixed(1)}m입니다. JavaScript를 켜면 보기를 직접 골라 볼 수
			있어요. 위의 지구·달 거리 그림에서도 같은 비율을 확인할 수 있어요.
		</p></noscript
	>
	<figcaption>
		지름 24cm인 농구공을 가정한 모형이에요. 실제 공의 크기는 제품마다 다를 수 있어요. 자세한 계산은
		앞 그림의 ‘정확한 계산 살펴보기’에 있어요.
	</figcaption>
</figure>

<style>
	.earth-moon-balls {
		margin: 28px 0 40px;
		padding: 28px;
		border-radius: 12px;
		background: var(--deep);
		color: #edf3f1;
	}
	h3 {
		margin: 0 0 14px;
		font-size: 24px;
		line-height: 1.5;
	}
	.earth-moon-balls .setup {
		color: #c1d3d4;
		font-size: 15px;
		margin: 0;
	}
	.ball-pair {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
		margin-top: 24px;
	}
	.ball {
		min-width: 0;
		text-align: center;
	}
	.ball svg {
		display: block;
		width: 100%;
		height: 150px;
	}
	h4 {
		margin: 6px 0;
		font-size: 16px;
	}
	.ball p {
		margin: 0;
		font-size: 14px;
		color: #c1d3d4;
	}
	.ball strong {
		color: #edf3f1;
	}
	.earth-moon-balls .pair-note,
	.earth-moon-balls .question-note {
		color: #c1d3d4;
		font-size: 13px;
		line-height: 1.8;
	}
	.earth-moon-balls .pair-note {
		margin: 24px 0 32px;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	legend {
		padding: 0;
		font-size: 18px;
		font-weight: 650;
		line-height: 1.6;
	}
	.question-note {
		margin: 12px 0 16px;
	}
	.choices {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	button {
		min-width: 64px;
		min-height: 44px;
		padding: 10px 16px;
		border: 1px solid #85aeb4;
		border-radius: 4px;
		background: transparent;
		color: #edf3f1;
		cursor: pointer;
		font: inherit;
	}
	button[aria-pressed='true'] {
		background: #28545c;
		border-color: #c3e1e2;
	}
	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.earth-moon-balls .answer {
		margin: 20px 0 0;
		min-height: 5.4em;
		font-size: 14px;
		line-height: 1.8;
		color: #dcebea;
	}
	.solution {
		margin-top: 12px;
	}
	.earth-moon-balls .distance {
		margin: 0;
		font-size: 18px;
		color: #efba8e;
	}
	.distance strong {
		font: 500 clamp(42px, 8vw, 64px) var(--font-mono);
	}
	.distance strong span {
		font-size: 24px;
		margin-left: 6px;
	}
	.earth-moon-balls .solution-note {
		margin: 8px 0 0;
		font-size: 13px;
		color: #c1d3d4;
		line-height: 1.8;
	}
	.end-labels {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 12px;
		color: #edf3f1;
		margin: 28px 0 0;
	}
	.scaled-balls {
		display: block;
		width: 100%;
		height: auto;
		min-height: 80px;
	}
	.earth-moon-balls .no-script-answer,
	figcaption {
		font-size: 13px;
		line-height: 1.9;
		color: #c1d3d4;
	}
	figcaption {
		margin-top: 20px;
	}
	@media (max-width: 600px) {
		.earth-moon-balls {
			padding: 22px 18px;
		}
		h3 {
			font-size: 22px;
		}
		.ball svg {
			height: 118px;
		}
	}
</style>
