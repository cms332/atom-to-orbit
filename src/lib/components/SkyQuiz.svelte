<script lang="ts">
	import { onMount } from 'svelte';
	import QuizConfetti from './QuizConfetti.svelte';
	let mounted = $state(false);
	let answer = $state<number | null>(null);
	let celebrating = $state(false);
	let celebrated = false;
	const choiceButtons: HTMLButtonElement[] = [];
	const options = [
		'태양이 저녁마다 식어서 빨개지기 때문',
		'빛이 공기를 더 길게 지나면서 파란빛이 더 많이 다른 방향으로 흩어지기 때문',
		'파란빛이 빨간빛으로 변하기 때문'
	];
	function stopCelebration() {
		celebrating = false;
	}
	function choose(index: number) {
		answer = index;
		if (index !== 1) {
			stopCelebration();
			return;
		}
		if (celebrated) return;
		celebrated = true;
		celebrating = true;
	}
	function reset() {
		stopCelebration();
		answer = null;
		celebrated = false;
		choiceButtons[0]?.focus({ preventScroll: true });
	}
	onMount(() => {
		mounted = true;
		const visibility = () => {
			if (document.hidden) stopCelebration();
		};
		document.addEventListener('visibilitychange', visibility);
		return () => {
			stopCelebration();
			document.removeEventListener('visibilitychange', visibility);
		};
	});
</script>

<aside class="sky-quiz" id="sky-quiz" aria-label="하늘색 이야기 확인 문제">
	{#if celebrating}
		<QuizConfetti onfinish={stopCelebration} />
	{/if}
	<h2>확인해 볼까요?</h2>
	<p>저녁노을이 붉게 보이는 주된 까닭은 무엇일까요?</p>
	{#if mounted}
		<div class="options" role="group" aria-label="노을이 붉은 까닭 고르기">
			{#each options as option, i (option)}<button
					bind:this={choiceButtons[i]}
					type="button"
					aria-pressed={answer === i}
					onclick={() => choose(i)}
					><span class="option-letter">{['A', 'B', 'C'][i]}</span>{option}</button
				>{/each}
		</div>
		<p class="feedback" role="status">
			{answer === null
				? ''
				: answer === 1
					? '맞아요! 햇빛이 공기 속을 길게 지나는 동안 파란빛이 더 많이 흩어져요. 그래서 곧장 통과한 빛에는 빨강과 주황빛이 두드러집니다.'
					: '다시 생각해 보세요. 태양이 낮을 때 빛이 공기를 지나는 길은 어떻게 달라졌나요? 파란빛의 색 자체가 바뀌지는 않아요.'}
		</p>
		{#if answer !== null}<button type="button" class="reset" onclick={reset}>다시 풀기</button>{/if}
	{:else}
		<ol type="A">
			{#each options as option (option)}<li>{option}</li>{/each}
		</ol>
		<details>
			<summary>정답 살펴보기</summary>
			<p>
				정답은 B입니다. 햇빛이 공기 속을 길게 지나는 동안 파란빛이 더 많이 흩어져요. 그래서 곧장
				통과한 빛에는 빨강과 주황빛이 두드러집니다.
			</p>
		</details>
	{/if}
</aside>

<style>
	.sky-quiz {
		position: relative;
		isolation: isolate;
		margin-top: 32px;
		padding: 24px;
		background: var(--soft-teal);
		border-radius: 10px;
	}
	h2 {
		margin: 0;
		font-size: 22px;
	}
	.options {
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
	.option-letter {
		flex: 0 0 auto;
		font: 13px var(--font-mono);
		padding-top: 5px;
	}
	.feedback {
		font-size: 15px;
		margin: 18px 0 0;
	}
	.feedback:empty {
		margin: 0;
	}
	.reset {
		width: auto;
		margin-top: 16px;
		padding: 10px 16px;
		font-size: 14px;
	}
	summary {
		padding-block: 12px;
		cursor: pointer;
	}
</style>
