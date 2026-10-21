import { motionArticle } from './motion-article';

export interface Article {
	slug: string;
	title: string;
	category: string;
	categoryId: string;
	intro: string;
	date: string;
	sourceIds: string[];
	diagram: 'moon' | 'atom' | 'motion';
	readingMinutes?: number;
	opening?: string[];
	sourceNote?: string;
	sections: {
		title: string;
		text: string;
		paragraphs?: string[];
		keyPoint?: string;
		sourceIds?: string[];
		visual?: 'inertia' | 'frames';
	}[];
	takeaway: string;
}
export const articles: Article[] = [
	motionArticle,
	{
		slug: 'earth-moon',
		title: '지구와 달은 얼마나 떨어져 있을까?',
		category: '태양계와 우주',
		categoryId: 'cosmos',
		intro:
			'평균 약 38만 4,400 km. 익숙한 지구의 지름을 자로 삼으면, 멀게만 느껴지는 숫자를 읽을 수 있습니다. 중심에서 중심까지의 거리와 표면 사이의 빈 공간을 구분하며 지구와 달의 규모를 살펴봅니다.',
		date: '2026-10-19',
		sourceIds: ['earth-facts', 'earth', 'moon'],
		diagram: 'moon',
		takeaway:
			'지구와 달의 평균 중심 간 거리는 지구 평균 지름의 약 30.2배입니다. 두 천체의 표면 사이 빈 공간은 지구 지름의 약 29.5배입니다.',
		sections: [
			{
				title: '먼저, 어디서 어디까지 잴까?',
				text: 'NASA가 소개하는 평균 거리 384,400 km는 지구 중심과 달 중심 사이의 대표 거리입니다. 지구의 평균 지름은 12,742 km, 달의 평균 지름은 3,474.8 km입니다. 두 지름은 NASA의 체적 평균 반지름을 각각 두 배 하여 구했습니다. 평균 지름은 천체와 같은 부피를 가진 구의 지름을 뜻합니다.'
			},
			{
				title: '지구의 지름을 자로 써 보면',
				text: '384,400 ÷ 12,742 ≈ 30.2. 지구 지름을 한 칸으로 삼으면 두 중심은 약 30.2칸 떨어져 있습니다. 표면 사이의 빈 공간만 알고 싶다면 두 반지름을 빼야 합니다. (384,400 − 6,371 − 1,737.4) ÷ 12,742 ≈ 29.5. “지구가 몇 개 들어갈까?”라는 질문도 어디서부터 재는지에 따라 답이 달라집니다.'
			},
			{
				title: '왜 평균이라고 할까?',
				text: '달의 궤도는 완전한 원이 아니어서 지구와 달 사이의 거리는 달라집니다. 이 글의 384,400 km는 특정 시각의 실시간 거리가 아닙니다. NASA Moon Fact Sheet에는 같은 값이 궤도 긴반지름으로도 제시됩니다. 하나의 대표값으로 관계를 이해하되, 매 순간 같은 거리라고 해석하지 않아야 합니다.'
			},
			{
				title: '작은 점도 정보가 된다',
				text: '이 글의 도식에서는 지름과 중심 간 거리 모두 같은 선형 축척을 사용했습니다. 그래서 달이 작게 보입니다. 화면에 맞추려고 달을 더 크게 그리면 거리를 체감하는 방식도 달라집니다. A2O는 정확한 비례 그림과 이해를 돕는 상징적 그림을 명시적으로 구분합니다.'
			}
		]
	},
	{
		slug: 'atomic-scale',
		title: '원자의 크기는 어떻게 읽을까?',
		category: '미시 세계',
		categoryId: 'micro',
		intro:
			'눈에 보이지 않는 크기를 이해하려면 먼저 어떤 길이를 말하는지 정해야 합니다. 보어 반지름의 두 배를 하나의 기준으로 삼고, 손안의 탁구공과 비교하며 나노미터와 로그 눈금의 의미를 읽어 봅니다.',
		date: '2026-10-19',
		sourceIds: ['nist', 'ittf'],
		diagram: 'atom',
		takeaway:
			'보어 반지름의 두 배는 약 0.106 nm입니다. 이는 원자 규모를 읽는 기준 길이이며, 모든 원자의 공통 지름을 뜻하지 않습니다.',
		sections: [
			{
				title: '원자에도 하나의 지름이 있을까?',
				text: '크기를 비교하기 전에 측정 기준을 정해야 합니다. 탐험기는 NIST가 제공하는 보어 반지름 a₀를 기준으로, 그 두 배인 2a₀를 사용합니다. 특정한 기준 길이를 모든 원자의 지름으로 일반화하지 않는 것이 이 비교의 출발점입니다.'
			},
			{
				title: '나노미터로 바꿔 읽기',
				text: 'NIST의 2022 CODATA 보어 반지름은 5.29177210544 × 10⁻¹¹ m입니다. 두 배 하면 약 1.06 × 10⁻¹⁰ m가 됩니다. 1 nm는 10⁻⁹ m이므로, 이를 나노미터로 표현하면 약 0.106 nm입니다. 화면에는 이해에 필요한 유효숫자 3자리로 반올림해 표시합니다.'
			},
			{
				title: '손안의 공과 비교하면',
				text: 'ITTF 2025 규정에 명시된 탁구공의 지름은 40 mm, 즉 0.04 m입니다. 이 길이를 2a₀로 나누면 약 3.78억 배입니다. 이는 두 길이의 비율이며 원자가 공 안에 몇 개 들어가는지에 대한 부피 계산은 아닙니다.'
			},
			{
				title: '왜 로그 눈금이 필요할까?',
				text: '이처럼 차이가 큰 길이를 보통 자에 함께 표시하면 작은 쪽은 거의 보이지 않습니다. 로그 눈금에서는 길이가 열 배 늘어날 때마다 같은 간격을 이동합니다. 탐험기의 점 위치가 뜻하는 것은 길이의 자릿수입니다. 그 점이나 원의 그림 크기 자체가 실제 크기의 비례를 나타내지는 않습니다.'
			}
		]
	}
];

export const articleTopics = [
	{ id: 'all', label: '전체' },
	...new Map(
		articles.map((article) => [
			article.categoryId,
			{ id: article.categoryId, label: article.category }
		])
	).values()
];
