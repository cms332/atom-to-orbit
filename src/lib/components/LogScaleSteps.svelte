<figure class="log-steps" aria-labelledby="log-steps-caption">
	<figcaption id="log-steps-caption">한 칸씩 옮길 때마다 길이는 열 배</figcaption>
	<ol>
		{#each ['1mm', '1cm', '10cm', '1m'] as label, i (label)}
			<li>
				<strong>{label}</strong>{#if i < 3}<span>10배 →</span>{/if}
			</li>
		{/each}
	</ol>
</figure>

<style>
	.log-steps {
		margin: 28px 0;
	}
	figcaption {
		font-size: 14px;
		color: var(--teal);
		margin-bottom: 18px;
	}
	ol {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		list-style: none;
		padding: 0;
		margin: 0;
		gap: 8px;
	}
	li {
		min-width: 0;
		margin: 0;
	}
	strong {
		display: block;
		border-bottom: 2px solid var(--teal);
		padding: 12px 0;
		font: 500 clamp(16px, 3vw, 23px) var(--font-mono);
		color: var(--ink);
	}
	span {
		display: block;
		font-size: 12px;
		color: var(--muted);
		margin-top: 10px;
	}
</style>
