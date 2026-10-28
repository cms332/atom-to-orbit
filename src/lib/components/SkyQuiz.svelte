<script lang="ts">
	import { onMount } from 'svelte';
	let mounted = $state(false);
	let answer = $state<number | null>(null);
	const options = [
		'태양이 저녁마다 식어서 빨개지기 때문',
		'빛이 공기를 더 길게 지나면서 파란빛이 더 많이 다른 방향으로 흩어지기 때문',
		'파란빛이 빨간빛으로 변하기 때문'
	];
	onMount(() => {
		mounted = true;
	});
</script>

<aside class="sky-quiz" aria-label="하늘색 이야기 확인 문제">
	<h2>확인해 볼까요?</h2>
	<p>저녁노을이 붉게 보이는 주된 까닭은 무엇일까요?</p>
	{#if mounted}
		<div role="group" aria-label="노을이 붉은 까닭 고르기">
			{#each options as option, i (option)}<button
					type="button"
					aria-pressed={answer === i}
					onclick={() => {
						answer = i;
					}}><span>{['A', 'B', 'C'][i]}</span>{option}</button
				>{/each}
		</div>
		<p class="feedback" role="status">
			{answer === null
				? ''
				: answer === 1
					? '맞아요! 같은 햇빛이라도 공기를 지나는 길이 길어지면, 곧장 도착하는 빛에 섞인 색의 비율이 달라집니다.'
					: '다시 생각해 보세요. 태양이 낮을 때 빛이 공기를 지나는 길은 어떻게 달라졌나요? 파란빛의 색 자체가 바뀌지는 않아요.'}
		</p>
		<button
			type="button"
			class="reset"
			onclick={() => {
				answer = null;
			}}>다시 생각하기</button
		>
	{:else}
		<ol type="A">
			{#each options as option (option)}<li>{option}</li>{/each}
		</ol>
		<details>
			<summary>정답 살펴보기</summary>
			<p>
				정답은 B입니다. 같은 햇빛이라도 공기를 지나는 길이 길어지면, 곧장 도착하는 빛에 섞인 색의
				비율이 달라집니다.
			</p>
		</details>
	{/if}
</aside>

<style>
	.sky-quiz {
		margin-top: 32px;
		padding: 24px;
		background: var(--soft-teal);
		border-radius: 10px;
	}
	h2 {
		margin: 0;
		font-size: 22px;
	}
	div {
		display: grid;
		gap: 8px;
	}
	button {
		display: flex;
		gap: 12px;
		text-align: left;
		width: 100%;
		font: inherit;
		font-size: 15px;
		line-height: 1.7;
		min-height: 44px;
		padding: 12px;
		border: 1px solid var(--teal);
		border-radius: 5px;
		background: transparent;
		color: var(--ink);
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		background: var(--teal);
		color: white;
	}
	span {
		font: 13px var(--font-mono);
		padding-top: 5px;
	}
	.feedback {
		font-size: 15px;
	}
	.feedback:empty {
		margin: 0;
	}
	.reset {
		width: auto;
	}
	summary {
		padding-block: 12px;
		cursor: pointer;
	}
</style>
