<script lang="ts">
	import { motionMeasurements } from '$lib/data/motion';
	let { sourceIds }: { sourceIds: readonly string[] } = $props();
</script>

<aside class="motion-speeds" aria-label="움직이는 지구의 대표 속도">
	<dl>
		{#each motionMeasurements as item (item.id)}
			{@const sourceNumber = sourceIds.indexOf(item.sourceId) + 1}
			<div>
				<dt>{item.name}</dt>
				<dd class="value">
					<span class="approx">약</span> <strong>{item.displayValue}</strong>
					<span>{item.displayUnit}</span>
					<a
						class="source-ref"
						href={`#source-${item.sourceId}`}
						aria-label={`${item.name} 출처 ${sourceNumber}`}>[{sourceNumber}]</a
					>
				</dd>
				<dd class="frame">{item.frame}</dd>
				<dd class="detail">
					{item.note}
				</dd>
			</div>
		{/each}
	</dl>
	<p>각 속도는 기준과 방향이 다르므로 숫자만 단순히 더할 수 없습니다.</p>
</aside>

<style>
	.motion-speeds {
		margin: 32px 0;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin: 0;
	}
	dl > div {
		padding-inline: 18px;
		min-width: 0;
	}
	dl > div:first-child {
		padding-left: 0;
		border: 0;
	}
	dl > div:last-child {
		padding-right: 0;
	}
	dt {
		font-size: 14px;
		font-weight: 650;
		margin-bottom: 12px;
	}
	dd {
		margin: 0;
	}
	.value {
		display: flex;
		align-items: baseline;
		gap: 6px;
		color: var(--teal);
		white-space: nowrap;
		font: 13px var(--font-mono);
	}
	.value strong {
		font-size: clamp(25px, 3vw, 31px);
		font-weight: 550;
		font-variant-numeric: tabular-nums;
	}
	.approx {
		font: 12px var(--font-sans);
	}
	.frame {
		font-size: 12px;
		line-height: 1.7;
		margin-top: 12px;
	}
	.detail,
	.motion-speeds p {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.8;
	}
	.detail {
		margin-top: 5px;
	}
	.source-ref {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		font: 12px var(--font-mono);
		text-decoration: none;
	}
	.source-ref:hover,
	.source-ref:focus-visible {
		text-decoration: underline;
	}
	.motion-speeds p {
		margin: 22px 0 0;
	}
	@media (max-width: 719px) {
		dl {
			grid-template-columns: 1fr;
		}
		dl > div,
		dl > div:first-child,
		dl > div:last-child {
			display: grid;
			grid-template-columns: 1fr auto;
			column-gap: 12px;
			padding: 19px 0;
			border: 0;
		}
		dl > div:first-child {
			border-top: 0;
			padding-top: 0;
		}
		dt {
			margin-bottom: 0;
			align-self: center;
		}
		.value {
			grid-column: 1 / -1;
			flex-wrap: wrap;
			white-space: normal;
			margin-top: 8px;
		}
		.value strong {
			font-size: 29px;
		}
		.frame {
			margin-top: 5px;
		}
		.detail {
			grid-column: 1 / -1;
		}
		.motion-speeds p {
			margin-top: 8px;
		}
	}
</style>
