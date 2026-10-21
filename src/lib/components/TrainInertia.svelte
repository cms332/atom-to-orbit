<figure class="inertia-figure">
	<div class="panels">
		{#each [false, true] as braking (braking)}
			<div>
				<h3>{braking ? '열차가 급제동하면' : '곧게, 일정한 속도로'}</h3>
				<svg
					viewBox="0 0 320 175"
					role="img"
					aria-label={braking
						? '열차가 감속할 때 물은 이전 운동을 유지하려 하여 진행 방향으로 쏠리는 개념도'
						: '일정한 속도로 직진하는 열차 안에서는 컵과 물이 열차와 함께 움직이는 개념도'}
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
						? '열차는 느려져도, 물은 이전 운동을 이어가려 합니다.'
						: '컵도, 물도, 우리도 같은 운동을 함께합니다.'}
				</p>
			</div>
		{/each}
	</div>
	<figcaption>
		관성을 설명하는 정성적 비유입니다. 지구의 공전은 방향이 계속 바뀌는 가속 운동이라는 점에서 이
		직선 운동과 다릅니다.
	</figcaption>
</figure>

<style>
	.inertia-figure {
		margin: 30px 0 40px;
		padding: 24px 0;
		border-block: 1px solid var(--line);
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
