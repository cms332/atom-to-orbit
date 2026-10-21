<script lang="ts">
	import ScaleExplorer from '$lib/components/ScaleExplorer.svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { DEFAULT_EXPONENT, explorerUrl, readExplorerExponent } from '$lib/utils/navigation-state';
	import { onMount } from 'svelte';
	let exponent = $state(DEFAULT_EXPONENT);
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	$effect(() => {
		if (mounted) exponent = readExplorerExponent(page.url.searchParams);
	});
	function updateSelection(value: number, mode: 'push' | 'replace') {
		const current = new URL(window.location.href);
		const url = explorerUrl(current, value);
		if (url.href === current.href) return;
		void goto(url, { replaceState: mode === 'replace', keepFocus: true, noScroll: true });
	}
	import { objects, qualifications, sourceById } from '$lib/data/science';
	import { objectLength, scientific } from '$lib/utils/scales';
</script>

<PageMeta
	title="크기 탐험"
	description={`10의 거듭제곱으로 이해하는 크기의 세계. ${objects.length}개의 출처 있는 대표 치수를 정확한 로그 눈금에서 탐험하세요.`}
/>
<div class="wrap page-content">
	<div class="page-intro">
		<h1>크기 탐험</h1>
		<p>
			10의 거듭제곱으로 이해하는 크기의 세계.<br />대상의 굵기·지름·길이·높이를 같은 눈금 위에서
			살펴보세요.
		</p>
	</div>
	<p class="note">
		눈금을 움직이거나 대상을 골라 보세요. 비교하는 치수와 측정 기준을 함께 표시합니다.
	</p>
	<ScaleExplorer bind:exponent onSelectionChange={updateSelection} />
	<details>
		<summary>왜 로그 눈금인가요?</summary>
		<p>
			작은 길이부터 큰 길이까지 한 화면에서 읽기 위한 눈금입니다. 10⁻¹⁰ m부터 태양의 지름까지, 한 칸
			오른쪽으로 갈 때마다 길이가 10배가 됩니다. 예를 들어 1 m → 10 m와 10 m → 100 m는 같은
			간격입니다.
		</p>
	</details>
	<section class="table-section" aria-labelledby="data-title">
		<div class="section-heading">
			<div>
				<h2 id="data-title">그림 뒤의 숫자들.</h2>
			</div>
			<p>인터랙션 없이도 모든 값을 읽을 수 있습니다.<br />원자료와 환산식을 함께 확인하세요.</p>
		</div>
		<div class="data-table-scroll">
			<table>
				<caption>대표 길이 데이터 · 출처 확인 2026-10-19</caption><thead
					><tr
						><th scope="col">대상</th><th scope="col">측정 기준</th><th scope="col">SI 미터</th><th
							scope="col">환산값</th
						><th scope="col">출처</th></tr
					></thead
				><tbody
					>{#each objects as object (object.id)}<tr
							><th scope="row" role="rowheader">{object.nameKo}</th><td role="cell"
								><span class="cell-label" aria-hidden="true">측정 기준</span><span
									>{object.measurement}<br />{qualifications[object.approximation]}</span
								></td
							>
							<td role="cell"
								><span class="cell-label" aria-hidden="true">SI 미터</span><span
									>{scientific(object.meters)}</span
								></td
							><td role="cell"
								><span class="cell-label" aria-hidden="true">환산값</span><span
									>{objectLength(object)}</span
								></td
							><td role="cell"
								><span class="cell-label" aria-hidden="true">출처·환산</span><span
									><a href={sourceById(object.sourceId).url}
										>{sourceById(object.sourceId).label} <span aria-hidden="true">↗</span></a
									><br />{object.derivation}</span
								></td
							>
						</tr>{/each}</tbody
				>
			</table>
		</div>
		<p class="note">
			생물의 대표 예시·평균·최대 크기와 사물의 명목·규격 치수를 구분했습니다. 포보스는 긴 축,
			베스타는 평균 지름, 행성은 체적 평균 지름을 비교합니다.
		</p>
	</section>
</div>

<style>
	.cell-label {
		display: none;
	}
	.table-section {
		margin-top: 70px;
	}
	td:nth-child(3),
	td:nth-child(4) {
		white-space: nowrap;
		font-family: ui-monospace, monospace;
	}
	th:first-child {
		min-width: 115px;
	}
	td {
		min-width: 130px;
	}
	td:last-child {
		min-width: 220px;
	}
	@media (max-width: 767px) {
		.data-table-scroll {
			overflow: visible;
			border: 0;
			margin-top: 24px;
		}
		table {
			display: block;
			background: none;
			font-size: 14px;
		}
		caption {
			display: block;
			padding: 0 0 20px;
			font-size: 12px;
			color: var(--muted);
		}
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
		}
		tbody {
			display: grid;
			gap: 24px;
		}
		tr {
			display: block;
			border: 1px solid var(--line);
			background: var(--surface);
			border-radius: 8px;
			padding: 18px;
		}
		th:first-child {
			display: block;
			background: none;
			padding: 0 0 16px;
			min-width: 0;
			font-size: 18px;
			border-bottom: 1px solid var(--line);
		}
		td,
		td:last-child,
		td:nth-child(3),
		td:nth-child(4) {
			display: grid;
			grid-template-columns: 84px minmax(0, 1fr);
			gap: 12px;
			padding: 12px 0;
			min-width: 0;
			white-space: normal;
			border: 0;
			font-family: var(--font-sans);
			overflow-wrap: anywhere;
		}
		td:last-child {
			padding-bottom: 0;
		}
		.cell-label {
			display: block;
			color: var(--muted);
			font-size: 12px;
		}
	}
</style>
