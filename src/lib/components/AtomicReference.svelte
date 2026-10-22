<script lang="ts">
	import Diagram from './Diagram.svelte';
	import ArticleDisclosure from './ArticleDisclosure.svelte';
</script>

<figure class="atomic-reference" aria-labelledby="atomic-reference-title">
	<div class="art"><Diagram kind="atom" /></div>
	<strong id="atomic-reference-title">약 0.106nm</strong>
	<figcaption>
		<p>
			원자를 알아보기 쉽게 그린 그림이에요. 실제 원자의 가장자리나 전자의 움직임을 그대로 나타낸
			것은 아니에요.
		</p>
		<ArticleDisclosure class="model-notes" label="모형 설명">
			<p>
				보어 반지름의 두 배인 2a₀를 원자 규모의 기준 길이로 사용합니다. 모든 원자의 공통 지름이
				아닙니다. 원자를 알아보기 쉽게 그린 상징적 그림이며 전자가 정해진 원을 따라 돈다는 뜻은
				아닙니다.
			</p>
			<a href="#source-nist">NIST · 원자의 기준 길이 ↗</a>
		</ArticleDisclosure>
	</figcaption>
</figure>

<style>
	.atomic-reference {
		margin: 28px 0 36px;
		padding: 26px;
		background: var(--soft-teal);
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.art {
		height: 230px;
	}
	strong {
		display: block;
		font: 500 29px var(--font-mono);
		color: var(--teal);
	}
	figcaption {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 18px;
	}
	figcaption p {
		margin: 0;
		font-size: inherit;
	}
	@media (max-width: 600px) {
		.atomic-reference {
			padding: 20px;
		}
	}
</style>
