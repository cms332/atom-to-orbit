import type { ScaleObject, ScienceSource } from './science';

export const additionalSources: ScienceSource[] = [
	{
		id: 'dna',
		label: 'OpenStax · Organic Chemistry, 28.2',
		url: 'https://openstax.org/books/organic-chemistry/pages/28-2-base-pairing-in-dna',
		accessedAt: '2026-10-19',
		basis: 'B형 DNA 이중나선의 가로 폭 20 Å = 2 nm. 조각의 전체 길이가 아닌 나선의 굵기입니다.'
	},
	{
		id: 'virus',
		label: 'CDC · Goldsmith et al., 2011',
		url: 'https://wwwnc.cdc.gov/eid/article/17/11/11-0258_article',
		accessedAt: '2026-10-19',
		basis:
			'MDCK 배양 H1N1(2009) 분리주의 음성염색 전자현미경 관찰에서 주로 구형인 입자의 평균 지름 104 nm. 모든 바이러스나 모든 H1N1 형태의 공통 크기가 아닙니다.'
	},
	{
		id: 'ecoli',
		label: 'Harvard BioNumbers · BNID 102065',
		url: 'https://bionumbers.hms.harvard.edu/bionumber.aspx?id=102065&ver=6',
		accessedAt: '2026-10-19',
		basis:
			'대장균 세포 길이의 대표 예시 2 μm. 세포의 성장 조건과 분열 단계에 따라 달라지며 편모는 포함하지 않습니다.'
	},
	{
		id: 'red-cell',
		label: 'NCBI · Clinical Methods, ch. 155',
		url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK263/',
		accessedAt: '2026-10-19',
		basis: '정상 사람 적혈구의 평균 원반 지름 약 7.5 μm. 두께나 혈관의 지름과 구분합니다.'
	},
	{
		id: 'hair',
		label: 'NNCO · Just How Small Is Nano?',
		url: 'https://www.nano.gov/about-nanotechnology/just-how-small-is-nano/',
		accessedAt: '2026-10-19',
		basis:
			'교육용 머리카락 굵기 예시 80,000–100,000 nm(80–100 μm). 그림에는 이 구간의 중간값 90 μm를 대표 예시로 사용하며 인구 평균이라고 해석하지 않습니다.'
	},
	{
		id: 'lead',
		label: 'Pentel · Super Hi-Polymer 0.5 mm',
		url: 'https://www.pentel.com/products/super-hi-polymer-lead-0-5mm-12-pieces',
		accessedAt: '2026-10-19',
		basis:
			'제조사의 0.5 mm 샤프심 명목 굵기 표기. 개별 심의 실제 지름이나 제조 공차를 직접 측정한 값이 아닙니다.'
	},
	{
		id: 'battery',
		label: 'Energizer · E91 AA Datasheet',
		url: 'https://data.energizer.com/pdfs/E91_Max_NA.pdf',
		accessedAt: '2026-10-19',
		basis:
			'AA / IEC-LR6 규격 외형의 최대 지름 14.50 mm, 최대 전체 길이 50.50 mm. 비교값은 지름이며 그림의 단자 포함 길이 비율은 50.5 / 14.5입니다.'
	},
	{
		id: 'coin',
		label: '한국은행 · 주화의 실제 지름',
		url: 'https://www.bok.or.kr/static/view/popup/2086_popup3.html',
		accessedAt: '2026-10-19',
		basis:
			'한국은행의 화폐도안 이용 예시에 명시된 100원화 실제 지름 24.00 mm. 원본 화폐도안은 사용하지 않고 숫자와 테두리를 새로 그립니다.'
	},
	{
		id: 'football',
		label: 'IFAB · Laws 2025/26, Law 2',
		url: 'https://www.theifab.com/laws/2025-26/the-ball/',
		accessedAt: '2026-10-19',
		basis:
			'구형 공의 규정 둘레 68–70 cm. 지름은 둘레 / π로 환산하며 중간 둘레 69 cm의 지름 약 21.96 cm를 비교 예시로 사용합니다.'
	},
	{
		id: 'whale',
		label: 'NOAA Fisheries · Blue Whale',
		url: 'https://www.fisheries.noaa.gov/species/blue-whale',
		accessedAt: '2026-10-19',
		basis:
			'남극 대왕고래는 약 110 ft까지 자랄 수 있다는 설명. 110 × 0.3048 = 33.528 m를 약 33.5 m로 반올림한 최대 크기 예시입니다. 평균 몸길이가 아닙니다.'
	},
	{
		id: 'iss',
		label: 'NASA · ISS Reference',
		url: 'https://www.nasa.gov/reference/international-space-station/',
		accessedAt: '2026-10-19',
		basis:
			'태양전지판을 가로지르는 전체 폭 109 m. 동일 자료의 모듈 방향 길이 51 m, 궤도 고도와 구분합니다.'
	},
	{
		id: 'tower',
		label: 'CVU · The Skyscraper Center',
		url: 'https://www.skyscrapercenter.com/building/lotte-world-tower/88',
		accessedAt: '2026-10-19',
		basis:
			'롯데월드타워 최고점 높이(To Tip) 555.7 m. 최저 주요 외부 보행자 출입구에서 최고점까지이며, 건축 높이(Architectural) 554.5 m와 구분합니다.'
	},
	{
		id: 'phobos',
		label: 'NASA Science · Phobos',
		url: 'https://science.nasa.gov/mars/moons/phobos/',
		accessedAt: '2026-10-19',
		basis:
			'불규칙한 포보스의 외형 약 27 × 22 × 18 km 중 가장 긴 축 27 km. 체적 평균 지름이 아닙니다.'
	},
	{
		id: 'vesta',
		label: 'NASA JPL · Vesta Trek',
		url: 'https://trek.nasa.gov/vesta/jpl/assets/quickfacts/vesta/quick-facts.html',
		accessedAt: '2026-10-19',
		basis:
			'베스타의 평균 지름 약 525 km. 불규칙한 실제 윤곽의 최대 폭과 구분하며 그림의 원형 기준에 적용합니다.'
	},
	{
		id: 'neptune',
		label: 'NASA · Neptune Fact Sheet',
		url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html',
		accessedAt: '2026-10-19',
		basis:
			'대기 1 bar 수준의 체적 평균 반지름 24,622 km를 두 배 한 지름 49,244 km. 적도 반지름과 구분합니다.'
	}
];

export const additionalObjects: ScaleObject[] = [
	{
		id: 'dna',
		nameKo: 'DNA 이중나선',
		nameEn: 'DNA DOUBLE HELIX',
		meters: 2e-9,
		dimensionKind: 'diameter',
		approximation: 'approximate',
		measurement: 'B형 이중나선의 굵기',
		briefKo:
			'두 가닥의 골격 사이에 염기쌍이 연결된 이중나선입니다. 비교하는 2 nm는 나선의 굵기이며, 그림에 보이는 DNA 조각의 길이와 구분합니다.',
		sourceId: 'dna',
		derivation: '20 Å × 10⁻¹⁰ = 2 × 10⁻⁹ m'
	},
	{
		id: 'virus',
		nameKo: 'H1N1 바이러스',
		nameEn: 'H1N1 VIRION',
		meters: 104e-9,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '구형 입자의 평균 지름',
		briefKo:
			'지질막 바깥에 짧은 단백질 돌기가 솟아 있습니다. 2009 H1N1 배양 시료의 음성염색 관찰에서 구형 입자 평균 104 nm를 사용했습니다. 길쭉한 입자도 존재합니다.',
		sourceId: 'virus',
		derivation: '104 nm × 10⁻⁹ = 1.04 × 10⁻⁷ m'
	},
	{
		id: 'ecoli',
		nameKo: '대장균',
		nameEn: 'ESCHERICHIA COLI',
		meters: 2e-6,
		dimensionKind: 'length',
		approximation: 'representative',
		measurement: '세포 몸통 길이',
		briefKo:
			'끝이 둥근 막대 모양의 세균입니다. 몸통 길이 2 μm를 대표 예시로 삼았으며, 성장 조건과 분열 단계에 따라 크기가 달라집니다. 편모 길이는 포함하지 않습니다.',
		sourceId: 'ecoli',
		derivation: '2 μm × 10⁻⁶ = 2 × 10⁻⁶ m'
	},
	{
		id: 'red-cell',
		nameKo: '사람 적혈구',
		nameEn: 'RED BLOOD CELL',
		meters: 7.5e-6,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '정상 적혈구의 평균 지름',
		briefKo:
			'가장자리가 두껍고 가운데가 양쪽으로 오목한 원반 모양입니다. 정상 사람 적혈구의 평균 지름 약 7.5 μm를 기준으로 비교합니다.',
		sourceId: 'red-cell',
		derivation: '7.5 μm × 10⁻⁶ = 7.5 × 10⁻⁶ m'
	},
	{
		id: 'hair',
		nameKo: '머리카락',
		nameEn: 'HUMAN HAIR',
		meters: 90e-6,
		rangeMeters: [80e-6, 100e-6],
		dimensionKind: 'diameter',
		approximation: 'representative',
		measurement: '굵기 80–100 μm의 중간 예시',
		briefKo:
			'표면에 기와처럼 겹친 큐티클이 보입니다. NNCO의 교육용 굵기 예시 80–100 μm에서 중간값 90 μm를 사용합니다. 그림의 가닥 길이가 아니라 굵기를 비교합니다.',
		sourceId: 'hair',
		derivation: '(80 + 100) ÷ 2 μm × 10⁻⁶ = 9 × 10⁻⁵ m'
	},
	{
		id: 'lead',
		nameKo: '0.5 mm 샤프심',
		nameEn: 'MECHANICAL PENCIL LEAD',
		meters: 0.0005,
		dimensionKind: 'diameter',
		approximation: 'nominal',
		measurement: '샤프심의 명목 굵기',
		briefKo:
			'곧고 가는 흑연 심입니다. 제품에 표시된 0.5 mm 명목 규격을 굵기의 기준으로 사용합니다. 화면에는 가닥의 일부를 보여주며 실제 제품 전체 길이를 나타내지 않습니다.',
		sourceId: 'lead',
		derivation: '0.5 mm ÷ 1,000 = 0.0005 m'
	},
	{
		id: 'battery',
		nameKo: 'AA 건전지',
		nameEn: 'AA BATTERY',
		meters: 0.0145,
		rangeMeters: [0.0137, 0.0145],
		dimensionKind: 'diameter',
		approximation: 'maximum',
		measurement: 'AA 규격의 최대 지름',
		briefKo:
			'원통형 몸체 끝에 양극 단자가 돌출되어 있습니다. E91 자료의 최대 지름 14.5 mm를 기준으로 삼고, 단자를 포함한 최대 길이 50.5 mm 비율도 그림에 반영했습니다.',
		sourceId: 'battery',
		derivation: '14.50 mm ÷ 1,000 = 0.0145 m'
	},
	{
		id: 'coin',
		nameKo: '100원 동전',
		nameEn: '100 WON COIN',
		meters: 0.024,
		dimensionKind: 'diameter',
		approximation: 'standard',
		measurement: '100원화의 지름',
		briefKo:
			'손안에서 크기를 가늠하기 좋은 원형 주화입니다. 지름 24 mm를 사용하며, 그림은 테두리와 액면 숫자로 새로 만든 간략 도식입니다.',
		sourceId: 'coin',
		derivation: '24.00 mm ÷ 1,000 = 0.024 m'
	},
	{
		id: 'football',
		displayDigits: 3,
		nameKo: '축구공',
		nameEn: 'FOOTBALL',
		meters: 0.69 / Math.PI,
		rangeMeters: [0.68 / Math.PI, 0.7 / Math.PI],
		dimensionKind: 'diameter',
		approximation: 'representative',
		measurement: '규정 둘레 중간값의 환산 지름',
		briefKo:
			'오각형과 육각형 패널로 익숙한 구형 공입니다. IFAB 2025/26 규정 둘레 68–70 cm 중 69 cm를 π로 나눈 지름 약 22 cm를 예시로 사용합니다.',
		sourceId: 'football',
		derivation: '0.69 m ÷ π ≈ 0.2196 m'
	},
	{
		id: 'whale',
		nameKo: '대왕고래',
		nameEn: 'BLUE WHALE',
		meters: 33.5,
		dimensionKind: 'length',
		approximation: 'maximum',
		measurement: '남극 개체의 최대 몸길이 예시',
		briefKo:
			'길게 뻗은 몸통, 작은 등지느러미와 넓은 꼬리지느러미가 특징입니다. NOAA가 설명한 남극 개체의 약 110 ft를 약 33.5 m로 환산한 최대 크기 예시입니다.',
		sourceId: 'whale',
		derivation: '110 ft × 0.3048 = 33.528 m ≈ 33.5 m'
	},
	{
		id: 'iss',
		nameKo: '국제우주정거장',
		nameEn: 'INTERNATIONAL SPACE STATION',
		meters: 109,
		dimensionKind: 'length',
		approximation: 'approximate',
		measurement: '태양전지판 포함 전체 폭',
		briefKo:
			'긴 트러스에 태양전지판과 거주·실험 모듈이 연결되어 있습니다. 태양전지판 끝에서 끝까지의 폭 109 m를 비교합니다. 모듈 길이나 궤도 고도와는 다른 치수입니다.',
		sourceId: 'iss',
		derivation: '태양전지판을 가로지르는 전체 폭 109 m'
	},
	{
		id: 'tower',
		nameKo: '롯데월드타워',
		nameEn: 'LOTTE WORLD TOWER',
		meters: 555.7,
		dimensionKind: 'height',
		approximation: 'approximate',
		measurement: '출입구 기준 최고점 높이',
		briefKo:
			'위로 갈수록 좁아지는 곡면과 갈라진 꼭대기가 특징입니다. 주요 외부 보행자 출입구 기준 최고점 높이 555.7 m를 세로로 비교하며, 건축 높이 554.5 m와 구분합니다.',
		sourceId: 'tower',
		derivation: 'To Tip 높이 555.7 m'
	},
	{
		id: 'phobos',
		nameKo: '화성의 위성 포보스',
		nameEn: 'PHOBOS',
		meters: 27000,
		dimensionKind: 'length',
		approximation: 'approximate',
		measurement: '불규칙한 외형의 긴 축',
		briefKo:
			'화성의 작은 위성으로 울퉁불퉁한 표면과 큰 스틱니 충돌구가 눈에 띕니다. NASA의 약 27 × 22 × 18 km 외형 중 가장 긴 축 27 km를 비교합니다.',
		sourceId: 'phobos',
		derivation: '긴 축 27 km × 1,000 = 27,000 m'
	},
	{
		id: 'vesta',
		nameKo: '소행성 베스타',
		nameEn: 'VESTA',
		meters: 525000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '평균 지름의 원형 기준',
		briefKo:
			'충돌구가 많은 소행성으로 남쪽에 거대한 충돌 분지가 있습니다. 평균 지름 약 525 km를 원형 기준에 적용하며, 표면의 요철과 충돌구는 형태를 알아보기 위한 도식입니다.',
		sourceId: 'vesta',
		derivation: '평균 지름 525 km × 1,000 = 525,000 m'
	},
	{
		id: 'neptune',
		nameKo: '해왕성',
		nameEn: 'NEPTUNE',
		meters: 49244000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름 · 1 bar 기준',
		briefKo:
			'구름 띠가 흐르는 얼음 거대 행성입니다. 1 bar 수준의 체적 평균 반지름을 두 배 했습니다. 그림의 어두운 폭풍은 보이저 관측을 참고한 도식이며 현재 날씨를 나타내지 않습니다.',
		sourceId: 'neptune',
		derivation: '24,622 km × 2 × 1,000 = 49,244,000 m'
	}
];
