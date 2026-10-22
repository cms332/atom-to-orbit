<script lang="ts">
	import ArticleDisclosure from './ArticleDisclosure.svelte';
</script>

<figure class="inertia-figure">
	<div class="panels">
		{#each [false, true] as braking (braking)}
			<div>
				<h3>{braking ? '갑자기 멈출 때' : '부드럽게 달릴 때'}</h3>
				<svg
					viewBox="0 0 320 175"
					role="img"
					aria-label={braking
						? '기차가 갑자기 느려지면 물은 계속 가려 하며 앞으로 쏠리는 그림'
						: '같은 빠르기로 곧게 달리는 기차 안에서 컵과 물이 함께 움직이는 그림'}
				>
					<rect x="16" y="15" width="288" height="139" rx="9" fill="var(--soft-teal)" />
					<path d="M34 123H286M47 146H273" stroke="#89a6a6" fill="none" stroke-width="2" />
					<path
						d="M130 58L137 118H183L190 58"
						stroke="var(--ink)"
						stroke-width="2.5"
						fill="var(--surface)"
					/>
					<path
						d={braking ? 'M135 97L186 76L181 115H139Z' : 'M135 89H185L181 115H139Z'}
						fill="#97c2c8"
					/>
					<path
						d={braking ? 'M135 97L186 76' : 'M135 89H185'}
						stroke="var(--teal)"
						stroke-width="2"
					/>
					<path
						d={braking ? 'M95 39H42L51 31M42 39L51 47' : 'M225 39H278L269 31M278 39L269 47'}
						stroke="var(--teal)"
						stroke-width="2"
						fill="none"
					/>
					{#if braking}<path
							d="M201 89H248L240 81M248 89L240 97"
							stroke="var(--ink)"
							stroke-width="2"
							fill="none"
						/>{/if}
				</svg>
				<p>
					{braking
						? '기차가 느려져도 물은 계속 가려 해요. 그래서 앞으로 쏠립니다.'
						: '컵도, 물도, 우리도 기차와 함께 움직여요.'}
				</p>
			</div>
		{/each}
	</div>
	<figcaption>
		<ArticleDisclosure class="model-notes" label="더 알아보기">
			<p>
				움직임을 이어가려는 성질을 관성이라고 합니다. 위 기차 그림은 같은 속력으로 직진할 때와
				느려질 때를 비교하는 비유입니다. 실제 흔들림의 크기를 계산한 그림은 아닙니다.
			</p>
			<p>
				속력이나 방향이 바뀌는 운동을 가속 운동이라고 합니다. 지구의 태양 공전은 방향이 계속
				달라지는 가속 운동입니다. 지구와 우리 몸은 태양의 중력 아래 거의 함께 자유낙하하며
				공전하므로, 태양 공전만으로 몸이 한쪽으로 밀리는 감각은 생기지 않습니다. 지표면에서는 지구
				중력에 맞서 몸을 받치는 땅의 힘을 느낍니다.
			</p>
			<p>
				태양 중력이 사라지는 것은 아닙니다. 지구와 우리에게 작용하는 중력의 작은 차이는 조석
				효과처럼 남습니다. 자전도 푸코 진자나 바람의 코리올리 효과로 관측할 수 있습니다. 일상에서
				뚜렷이 느끼기 어렵다는 뜻이며 효과가 없다는 뜻은 아닙니다.
			</p>
			<a href="#source-motion-inertia">ESA · Space Science FAQ ↗</a>
			<a href="#source-motion-freefall">NASA · 중력과 자유낙하 ↗</a>
			<a href="#source-motion-microgravity-for-kids">NASA · 함께 떨어지는 운동 ↗</a>
			<a href="#source-motion-tides">NOAA · 조석 효과 ↗</a>
			<a href="#source-motion-pendulum">Smithsonian · 푸코 진자 ↗</a>
			<a href="#source-motion-coriolis">NOAA · 코리올리 효과 ↗</a>
		</ArticleDisclosure>
	</figcaption>
</figure>

<style>
	.inertia-figure {
		margin: 30px 0 40px;
		padding: 0;
	}
	.panels {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 22px;
	}
	h3 {
		font-size: 16px;
		margin: 0 0 12px;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.panels p {
		font-size: 13px;
		line-height: 1.8;
		margin: 10px 0 0;
	}
	figcaption {
		font-size: 12px;
		line-height: 1.9;
		color: var(--muted);
		margin-top: 20px;
	}
	@media (max-width: 600px) {
		.panels {
			grid-template-columns: 1fr;
			gap: 26px;
		}
	}
</style>
