<script lang="ts">
	import { onMount } from 'svelte';
	let mounted = $state(false);
	let answer = $state<number | null>(null);
	onMount(() => {
		mounted = true;
	});
</script>

<aside class="starlight-quiz" aria-label="별빛 이야기 확인 문제">
	<h2>생각해 보세요</h2>
	<p>10광년 떨어진 별에서 지금 받은 빛은 대략 언제 출발했을까요?</p>
	{#if mounted}
		<div role="group" aria-label="별빛이 출발한 때 고르기">
			{#each ['10일 전', '10년 전', '100년 전'] as option, index (option)}<button
					type="button"
					aria-pressed={answer === index}
					onclick={() => {
						answer = index;
					}}>{option}</button
				>{/each}
		</div>
		<p class="feedback" role="status">
			{answer === null
				? ''
				: answer === 1
					? '✓ 맞아요. 1광년은 빛이 1년 동안 가는 거리예요.'
					: '다시 생각해 보세요. ‘광년’은 거리를 나타내는 말이에요. 빛이 그 거리를 가는 데 몇 년 걸릴까요?'}
		</p>
	{:else}
		<p>① 10일 전 / ② 10년 전 / ③ 100년 전</p>
		<details>
			<summary>정답 살펴보기</summary>
			<p>10년 전입니다. 1광년은 빛이 1년 동안 가는 거리예요.</p>
		</details>
	{/if}
</aside>

<style>
	.starlight-quiz {
		margin-top: 44px;
		padding: 24px;
		background: var(--soft-teal);
		border-radius: 10px;
	}
	.starlight-quiz h2 {
		margin: 0;
		font-size: 22px;
	}
	div {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	button {
		min-height: 44px;
		padding: 10px 18px;
		border: 1px solid var(--teal);
		border-radius: 5px;
		background: transparent;
		color: var(--teal);
		font: inherit;
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		background: var(--teal);
		color: white;
	}
	.feedback {
		font-size: 15px;
	}
	.feedback:empty {
		margin: 0;
	}
	summary {
		cursor: pointer;
		padding-block: 12px;
	}
</style>
