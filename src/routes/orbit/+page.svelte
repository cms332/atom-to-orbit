<script lang="ts">
	import OrbitExperience from '$lib/components/OrbitExperience.svelte';
	import { orbitPlanets, orbitSources } from '$lib/data/orbits';
	import { orbitBodySizes } from '$lib/data/orbit-body-sizes';
	import { orbitPeriod } from '$lib/utils/orbit-model';
</script>

<svelte:head
	><title>궤도 탐험 | A2O — Atom to Orbit</title><meta
		name="description"
		content="태양과 함께 은하를 가로지르는 여덟 행성. 바로 열리는 3D 장면에서 시선을 바꾸고, 한국어 이야기로 궤적을 읽어보세요."
	/></svelte:head
>

<OrbitExperience />
<div class="wrap notes" id="orbit-model">
	<details class="model-notes">
		<summary>이 장면의 과학적 근사와 출처</summary>
		<div class="model-grid">
			<div>
				<h2>움직임은 같아도, 궤적은 달라집니다.</h2>
				<p>
					태양과 함께 움직이면 행성의 공전은 거의 닫힌 타원으로 보입니다. 은하 기준으로 보면 태양계
					전체의 이동이 더해져 열린 궤적이 됩니다. 행성이 태양 뒤로 끌려가는 소용돌이라는 뜻은
					아닙니다.
				</p>
				<p>
					은하 기준 화면의 기본 카메라는 태양을 따라가며, 이야기의 마지막 장에서는 지구를 가까이서
					따라갑니다. 지나온 위치를 은하의 축에 맞춰 잇고, 은하 공전의 짧은 구간을 등속 직선
					이동으로 근사합니다.
				</p>
				<p>
					‘가까이 보기’는 선택한 천체를 따라가는 시점입니다. 대상은 화면의 같은 위치에서 자전하고,
					주변 천체와 궤적은 대상에 대한 상대 위치로 움직입니다. 다른 천체를 선택한 천체 둘레의 새
					궤도로 옮기는 것은 아니며, 기존 공전 좌표를 그대로 사용합니다.
				</p>
			</div>
			<div>
				<h2>수치와 화면 표현의 차이</h2>
				<p>
					NASA/JPL의 J2000 궤도요소와 변화율로 케플러 타원 공전을 계산합니다. 모든 행성에 같은 시간
					배속을 적용하고, 궤도 거리는 선형 AU에 비례합니다. 태양의 대표 은하 이동 속도는 약 230
					km/s입니다.
				</p>
				<p>
					기본 ‘시각적 강조’는 태양 이동 성분만 1/20로 줄입니다. 설정에서 ‘실제 속도 비율’로 되돌릴
					수 있습니다. 일반 탐험과 이야기 1~5장에서는 천체의 지름을 알아보기 위해 확대했으며 실제
					크기 비례가 아닙니다. 6장에서는 태양과 여덟 행성의 체적 평균 지름을 거리와 같은 AU
					축척으로 표현하고, 카메라를 지구에 근접시킵니다. 화면에서 보이는 크기는 관찰 거리와 원근에
					따라 달라지며, 멀리 있는 천체는 매우 작게 보입니다. 이 근접 시점에서는 시선과 거의
					나란해져 접힌 듯 보이는 자취 구간을 부드럽게 흐립니다. 궤적 좌표를 바꾸는 처리는 아닙니다.
				</p>
				<p>
					은하 궤적의 기본 카메라는 안쪽 행성을 중심으로 잡습니다. ‘태양계’도 수성·금성·지구·화성이
					잘 보이는 거리에서 시작하며, 화면을 축소하면 바깥 행성까지 볼 수 있습니다.
				</p>
			</div>
		</div>
		<p>
			모델 범위는 J2000부터 40년이며 끝에 도달하면 처음부터 반복합니다. 지구는 지구–달 질량중심으로
			근사합니다. 달, 섭동의 정밀 적분, 태양의 고유운동과 은하 궤도 곡률은 생략했습니다. 공전
			기준선은 J2000 궤도입니다. 행성 자전·조명·고리 무늬와 배경 별은 설명용 표현이며, 실제 관측
			시각의 표면 방향이나 별자리 지도가 아닙니다.
		</p>
		<div class="data-scroll">
			<table>
				<caption>J2000 대표 궤도 수치 · AU / 지구년</caption><thead
					><tr
						><th scope="col">행성</th><th scope="col">긴반지름</th><th scope="col">이심률</th><th
							scope="col">공전 주기</th
						></tr
					></thead
				><tbody
					>{#each orbitPlanets as planet (planet.id)}<tr
							><th scope="row">{planet.name}</th><td>{planet.a[0].toFixed(3)}</td><td
								>{planet.e[0].toFixed(4)}</td
							><td>{orbitPeriod(planet).toFixed(2)}</td></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<p>
			1 AU = 149,597,870,700 m. 1 율리우스년 = 365.25일. 주기는 JPL 평균 황경 변화율에서 얻은 항성
			주기 근사입니다.
		</p>
		<ul class="sources">
			{#each orbitSources as source (source.url)}<li>
					<a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
					<p>{source.note}</p>
				</li>{/each}
			{#each orbitBodySizes as body (body.id)}<li>
					<a href={body.source.url} target="_blank" rel="noreferrer">{body.source.label} ↗</a>
					<p>{body.source.basis}</p>
				</li>{/each}
		</ul>
		<h2>이미지와 라이브러리</h2>
		<p>
			행성 8종·태양·지구 구름 표면: <a
				href="https://www.solarsystemscope.com/textures/"
				target="_blank"
				rel="noreferrer">Solar System Scope / INOVE</a
			>,
			<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer"
				>CC BY 4.0</a
			>. 원본 2K 지도를 1024 × 512 WebP로 축소·변환했습니다. 일부 미관측 지역은 원본 제작자의 보완
			지형이며 색은 보정되어 있습니다. 토성 고리 무늬·별 배경·태양 후광은 A2O의 절차적 표현입니다.
		</p>
		<p>
			<a href="/licenses/orbit-textures.txt">이미지별 원본과 변경 내역</a> · Three.js
			<a href="/licenses/three-MIT.txt">MIT</a>
			· <a href="/licenses/erfa-icrs2g.txt">ERFA 좌표 상수 고지</a>
		</p>
	</details>
</div>

<style>
	.notes {
		padding-block: 24px 40px;
		scroll-margin-top: 24px;
	}
	details {
		border-bottom: 1px solid var(--line);
	}
	summary {
		min-height: 48px;
		align-content: center;
		font-size: 14px;
		color: var(--muted);
		cursor: pointer;
	}
	h2 {
		font-size: 20px;
		line-height: 1.5;
		margin-block: 28px 14px;
	}
	p {
		font-size: 14px;
		max-width: 1000px;
		line-height: 1.9;
	}
	.model-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 64px;
	}
	.data-scroll {
		overflow: auto;
		margin-block: 32px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 14px;
	}
	caption {
		text-align: left;
		color: var(--muted);
		padding-bottom: 16px;
		font-size: 13px;
	}
	th,
	td {
		padding: 12px 14px;
	}
	thead {
		background: var(--soft-teal);
	}
	tbody tr:nth-child(even) {
		background: #eef2ed;
	}
	.sources {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 20px 40px;
		margin-top: 32px;
	}
	.sources a {
		color: var(--teal);
		font-size: 14px;
		display: inline-block;
		min-height: 44px;
		align-content: center;
	}
	.sources p {
		margin: 0;
	}
	@media (max-width: 767px) {
		.model-grid,
		.sources {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
		th,
		td {
			padding: 10px 8px;
			font-size: 12px;
		}
	}
</style>
