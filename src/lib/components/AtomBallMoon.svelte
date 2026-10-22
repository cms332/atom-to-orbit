<script lang="ts">
	import ArticleDisclosure from './ArticleDisclosure.svelte';
	import { BOHR_RADIUS } from '$lib/data/science';
	import {
		ATOM_BALL_LENGTH_RATIO,
		ATOM_MODEL_FACTOR,
		ENLARGED_BALL_METERS,
		MOON_TO_ENLARGED_BALL_RATIO,
		atomReference,
		moonReference
	} from '$lib/data/atomic-scale-comparison';
	const radius = 104;
	const moonRadius = radius * MOON_TO_ENLARGED_BALL_RATIO;
	const craters = [
		[-0.36, -0.31, 0.16],
		[0.32, 0.24, 0.23],
		[0.12, -0.56, 0.11],
		[-0.43, 0.4, 0.1]
	];
</script>

<figure class="atom-ball-moon" aria-labelledby="atom-ball-moon-title">
	<h3 id="atom-ball-moon-title">탁구공이 달보다 조금 더 커져요</h3>
	<p class="setup">
		원자의 기준 길이를 <strong>1cm</strong>로 키우고, 탁구공도 똑같은 비율로 키웠어요.
	</p>
	<div class="comparison">
		<div class="body">
			<h4>커진 탁구공</h4>
			<svg viewBox="0 0 240 240" role="img" aria-labelledby="model-ball-title">
				<title id="model-ball-title"
					>원자의 기준 길이를 1cm로 키웠을 때 지름 약 3,800km가 되는 탁구공</title
				>
				<circle
					data-body="model-ball"
					data-diameter-m={ENLARGED_BALL_METERS}
					cx="120"
					cy="120"
					r={radius}
					fill="#f9faf6"
					stroke="#54777e"
					stroke-width="1.5"
				/>
				<path
					d="M62 91 Q82 62 111 62"
					stroke="#d5dfdc"
					stroke-width="5"
					stroke-linecap="round"
					fill="none"
				/>
			</svg>
			<p class="diameter">지름 약 <strong>3,800<span>km</span></strong></p>
		</div>
		<div class="body">
			<h4>실제 달</h4>
			<svg viewBox="0 0 240 240" role="img" aria-labelledby="comparison-moon-title">
				<title id="comparison-moon-title"
					>지름 약 3,475km인 실제 달을 커진 탁구공과 같은 비율로 그린 원</title
				>
				<circle
					data-body="moon"
					data-diameter-m={moonReference.meters}
					cx="120"
					cy="120"
					r={moonRadius}
					fill="#9cb0b4"
					stroke="#54777e"
					stroke-width={1.5 * MOON_TO_ENLARGED_BALL_RATIO}
				/>
				{#each craters as [x, y, r], i (i)}<circle
						cx={120 + x * moonRadius}
						cy={120 + y * moonRadius}
						r={r * moonRadius}
						fill="#7c969e"
					/>{/each}
			</svg>
			<p class="diameter">지름 약 <strong>3,475<span>km</span></strong></p>
		</div>
	</div>
	<figcaption>
		<p>
			두 그림은 같은 비율로 지름을 비교했어요. 원자는 단단한 구슬이 아니며, 크기 차이를 상상하기
			위한 그림이에요.
		</p>
		<ArticleDisclosure class="model-notes" label="자세한 계산 보기">
			<p>
				NIST의 보어 반지름 a₀ = {BOHR_RADIUS.toExponential(11)}m. 기준 길이 2a₀ = {atomReference.meters.toExponential(
					11
				)}m ≈ 0.106nm입니다. 탁구공 지름은 40mm = 0.04m이므로 길이 비는 0.04 ÷ 2a₀ ≈ {(
					ATOM_BALL_LENGTH_RATIO / 1e8
				).toFixed(2)}억 배입니다. 부피나 원자 개수를 계산한 값이 아닙니다.
			</p>
			<p>
				원자의 기준 길이를 1cm = 0.01m로 놓으면 확대 배율은 0.01 ÷ 2a₀ ≈ {ATOM_MODEL_FACTOR.toExponential(
					5
				)}배입니다. 탁구공 지름은 0.04 × 확대 배율 ≈ {(ENLARGED_BALL_METERS / 1000).toFixed(2)}km,
				본문에서는 약 3,800km로 반올림합니다. 달의 체적 평균 반지름 1,737.4km를 두 배 하면 지름
				3,474.8km입니다. 두 원의 크기 비율에는 반올림 전 값을 사용합니다.
			</p>
			<a href="#source-nist">NIST · 보어 반지름 ↗</a>
			<a href="#source-ittf">ITTF · 탁구공 지름 ↗</a>
			<a href="#source-moon">NASA · 달의 크기 ↗</a>
		</ArticleDisclosure>
	</figcaption>
</figure>

<style>
	.atom-ball-moon {
		margin: 30px 0 40px;
		padding: 28px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--soft-teal);
	}
	h3 {
		margin: 0 0 14px;
		font-size: 24px;
		line-height: 1.5;
	}
	.setup {
		margin: 0 0 28px;
		font-size: 15px;
	}
	.comparison {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
	}
	.body {
		min-width: 0;
		text-align: center;
	}
	h4 {
		font-size: 15px;
		margin: 0 0 12px;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		max-width: 280px;
		margin-inline: auto;
	}
	.diameter {
		margin: 12px 0 0;
		font-size: 12px;
	}
	.diameter strong {
		display: block;
		margin-top: 6px;
		font: 500 clamp(23px, 4vw, 34px) var(--font-mono);
		color: var(--teal);
		white-space: nowrap;
	}
	.diameter strong span {
		font-size: 14px;
		margin-left: 3px;
	}
	figcaption {
		margin-top: 26px;
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	figcaption p {
		font-size: inherit;
		margin: 0;
	}
	figcaption :global(a) {
		margin-right: 16px;
	}
	@media (max-width: 600px) {
		.atom-ball-moon {
			padding: 22px 18px;
		}
		.comparison {
			gap: 12px;
		}
		h3 {
			font-size: 22px;
		}
	}
</style>
