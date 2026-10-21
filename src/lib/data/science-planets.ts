import type { ScaleObject, ScienceSource } from './science';

export const PLANET_IDS = [
	'mercury',
	'venus',
	'earth',
	'mars',
	'jupiter',
	'saturn',
	'uranus',
	'neptune'
] as const;
export const SATURN_DIAMETER_METERS = 58_232 * 2 * 1_000;
export const SATURN_RINGS_KM = {
	cInner: 74_658,
	bInner: 91_975,
	bOuter: 117_507,
	aInner: 122_340,
	aOuter: 136_780
} as const;
const nasa = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
export const planetSources: ScienceSource[] = [
	{
		id: 'mercury',
		label: 'NASA · Mercury Fact Sheet',
		url: nasa + 'mercuryfact.html',
		accessedAt: '2026-10-19',
		basis:
			'체적 평균 반지름 2,439.7 km를 두 배 한 본체 지름 4,879.4 km. 적도 반지름 2,440.5 km와 구분합니다.'
	},
	{
		id: 'venus',
		label: 'NASA · Venus Fact Sheet',
		url: nasa + 'venusfact.html',
		accessedAt: '2026-10-19',
		basis:
			'체적 평균 반지름 6,051.8 km를 두 배 한 지름 12,103.6 km. 구름의 무늬는 형태 도식이며 별도 실측 지형이 아닙니다.'
	},
	{
		id: 'mars',
		label: 'NASA · Mars Fact Sheet',
		url: nasa + 'marsfact.html',
		accessedAt: '2026-10-19',
		basis:
			'체적 평균 반지름 3,389.5 km를 두 배 한 지름 6,779 km. 적도 반지름 3,396.2 km와 구분합니다.'
	},
	{
		id: 'saturn',
		label: 'NASA · Saturn Fact Sheet',
		url: nasa + 'saturnfact.html',
		accessedAt: '2026-10-19',
		basis:
			'1 bar 수준 체적 평균 반지름 58,232 km를 두 배 한 행성 본체 지름 116,464 km. 고리의 폭을 본체 지름에 포함하지 않습니다.'
	},
	{
		id: 'uranus',
		label: 'NASA · Uranus Fact Sheet',
		url: nasa + 'uranusfact.html',
		accessedAt: '2026-10-19',
		basis:
			'1 bar 수준 체적 평균 반지름 25,362 km를 두 배 한 본체 지름 50,724 km. 해왕성의 체적 평균 지름보다 조금 큽니다.'
	},
	{
		id: 'saturn-rings',
		label: 'NASA · Saturnian Rings Fact Sheet',
		url: nasa + 'satringfact.html',
		accessedAt: '2026-10-19',
		basis:
			'토성 중심 기준 C 고리 안쪽 74,658 km, B 고리 바깥 117,507 km, A 고리 안쪽 122,340 km·바깥 136,780 km. 주 고리 도식에 본체와 같은 축척으로 적용하며 보이는 기울기는 도식의 관찰 각도입니다.'
	}
];

export const planetObjects: ScaleObject[] = [
	{
		id: 'mercury',
		nameKo: '수성',
		nameEn: 'MERCURY',
		meters: 4_879_400,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'충돌구와 밝은 방사상 흔적이 남은 회색 암석 행성입니다. 체적 평균 반지름 2,439.7 km의 두 배를 비교하며, 달 다음 크기에 놓입니다.',
		sourceId: 'mercury',
		derivation: '2,439.7 km × 2 × 1,000 = 4,879,400 m'
	},
	{
		id: 'venus',
		nameKo: '금성',
		nameEn: 'VENUS',
		meters: 12_103_600,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'두꺼운 대기의 밝은 구름이 표면을 덮은 행성입니다. 체적 평균 반지름을 두 배 한 지름은 지구보다 조금 작습니다. 구름 무늬는 관측 영상을 단순화한 도식입니다.',
		sourceId: 'venus',
		derivation: '6,051.8 km × 2 × 1,000 = 12,103,600 m'
	},
	{
		id: 'mars',
		nameKo: '화성',
		nameEn: 'MARS',
		meters: 6_779_000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'붉은 표면과 밝은 극관이 특징인 암석 행성입니다. 체적 평균 반지름 3,389.5 km를 두 배 했습니다. 크기순에서는 수성과 금성 사이에 놓입니다.',
		sourceId: 'mars',
		derivation: '3,389.5 km × 2 × 1,000 = 6,779,000 m'
	},
	{
		id: 'saturn',
		nameKo: '토성',
		nameEn: 'SATURN',
		meters: SATURN_DIAMETER_METERS,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름 · 본체 · 1 bar',
		briefKo:
			'넓은 고리가 본체 앞뒤로 펼쳐지는 거대 행성입니다. 비교값 116,464 km는 고리를 제외한 본체의 체적 평균 지름입니다. 주 고리는 NASA 자료의 반지름 비율을 적용해 그렸습니다.',
		sourceId: 'saturn',
		derivation: '58,232 km × 2 × 1,000 = 116,464,000 m'
	},
	{
		id: 'uranus',
		nameKo: '천왕성',
		nameEn: 'URANUS',
		meters: 50_724_000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름 · 1 bar 기준',
		briefKo:
			'옅은 청록빛 대기와 희미한 구름 무늬를 가진 얼음 거대 행성입니다. 1 bar 수준의 체적 평균 반지름을 두 배 했습니다. 같은 기준에서 해왕성보다 지름이 조금 큽니다.',
		sourceId: 'uranus',
		derivation: '25,362 km × 2 × 1,000 = 50,724,000 m'
	}
];
