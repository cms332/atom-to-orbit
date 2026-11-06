import type { Article } from './articles';
import type { ScienceSource } from '../data/science';

export const moonFaceSources: ScienceSource[] = [
	{
		id: 'moon-face-rotation',
		label: 'NASA · Top Moon Questions',
		url: 'https://science.nasa.gov/moon/top-moon-questions/',
		accessedAt: '2026-11-07',
		basis: '달의 자전과 공전에 걸리는 시간, 지구에서 같은 면을 보는 이유.'
	},
	{
		id: 'moon-face-tides',
		label: 'NASA · Tidal Locking',
		url: 'https://science.nasa.gov/moon/tidal-locking/',
		accessedAt: '2026-11-07',
		basis: '지구가 달의 가까운 쪽과 먼 쪽을 당기는 힘의 차이와 달의 회전 변화.'
	},
	{
		id: 'moon-face-phases',
		label: 'NASA · Moon Phases',
		url: 'https://science.nasa.gov/moon/moon-phases/',
		accessedAt: '2026-11-07',
		basis: '햇빛을 받는 면, 보름달이 다시 보이는 주기와 칭동.'
	}
];
export const moonFaceArticle: Article = {
	slug: 'why-moon-shows-same-face',
	title: '달은 왜 늘 같은 얼굴을 보여줄까?',
	category: '태양계와 우주',
	categoryId: 'cosmos',
	diagram: 'moon-face',
	date: '2026-11-07',
	intro:
		'보름달에서 토끼를 찾아본 적 있나요? 다음 보름달에도 그 무늬는 우리를 향해 있어요. 달이 도는데도 말이에요.',
	takeaway: '친구에게 계속 얼굴을 보여주면서 친구 주위를 한 바퀴 돌아볼까요?',
	sourceIds: moonFaceSources.map((s) => s.id),
	sourceNote: '달의 움직임과 햇빛을 설명하는 데 참고한 자료예요.',
	sections: [
		{
			title: '달은 두 가지 방법으로 돌아요',
			text: '팽이는 자기 몸을 빙글빙글 돌려요. 달도 이렇게 몸을 돌려요. 자기 몸이 도는 움직임을 ‘자전’이라고 해요.',
			paragraphs: [
				'달은 몸을 돌리면서 지구 주위를 따라 움직여요. 이렇게 다른 천체 둘레를 도는 움직임을 ‘공전’이라고 해요.',
				'달이 지구 둘레를 한 바퀴 도는 데는 약 27일이 걸려요. 그동안 달은 같은 방향으로 자기 몸도 딱 한 바퀴 돌려요. 그래서 지구에서는 달의 거의 같은 쪽을 보게 돼요.'
			],
			details: {
				title: '왜 ‘거의’ 같은 쪽일까요?',
				paragraphs: [
					'여러 날에 걸쳐 보면 달이 고개를 살짝 젓거나 끄덕이는 것처럼 보여요. 달의 궤도가 조금 길쭉하고 달이 도는 축도 기울어져 있기 때문이에요. 덕분에 가장자리 너머도 조금씩 볼 수 있어요. 과학자들은 이 모습을 ‘칭동’이라고 불러요.'
				]
			}
		},
		{
			title: '반 바퀴 걸으면 내 코는 어디를 향할까요?',
			text: '친구를 가운데 세우고 서로 마주 보세요. 이제 친구를 계속 바라보면서 친구 둘레를 반 바퀴 걸어요. 내 코는 여전히 친구를 향하지만, 내 등 뒤에는 아까와 다른 벽이 있지요? 나도 모르게 몸을 반 바퀴 돌린 거예요.',
			paragraphs: [
				'이번에는 코를 창문 쪽에 고정한 채 친구 둘레를 걸어 보세요. 처음에 내 얼굴을 보던 친구는 반 바퀴 뒤에 내 등을 보게 돼요.',
				'아래 두 달에 주황색 표식을 붙였어요. 내 코라고 생각하고 ‘반 바퀴’를 눌러 보세요.'
			],
			visual: 'moon-rotation'
		},
		{
			title: '두 바퀴의 시간이 어떻게 맞아졌을까요?',
			text: '아주 오래전에는 달이 지금보다 더 빨리 돌았을 거예요. 지구는 달의 가까운 쪽을 먼 쪽보다 조금 더 세게 당겨요. 그래서 달의 몸은 지구 쪽을 따라 아주 살짝 길어져요.',
			paragraphs: [
				'빠르게 돌던 달에서는 늘어나는 부분이 계속 바뀌었어요. 그때마다 달 속의 암석이 조금씩 변형되면서, 회전에 쓰이던 에너지의 일부가 열로 바뀌었어요.',
				'오랜 시간이 지나 달의 자전이 느려졌고, 한 번 자전하는 시간과 한 번 공전하는 시간이 맞아졌어요. 지금처럼 두 시간이 맞물린 상태를 ‘조석 고정’이라고 해요.'
			]
		},
		{
			title: '달의 뒷면에도 아침이 와요',
			text: '달의 앞면은 지구를 보는 쪽이고, 뒷면은 그 반대쪽이에요. 그런데 낮과 밤을 가르는 건 지구가 아니라 햇빛이에요.',
			paragraphs: [
				'보름달 무렵에는 달의 앞면이 햇빛을 받아 환해요. 약 보름 뒤, 달이 하늘에서 태양 가까이에 보이는 새달 무렵에는 뒷면이 햇빛을 받아요. 그곳에 서 있다면 사방이 밝겠지요.'
			],
			visual: 'moon-lighting',
			details: {
				title: '보름달은 왜 27일마다 뜨지 않을까요?',
				paragraphs: [
					'먼 별을 기준으로 재면 달이 지구를 한 바퀴 도는 데 약 27.3일이 걸려요. 그사이 지구도 태양 둘레를 조금 움직여요. 달이 다시 보름달이 되는 자리에 닿으려면 이틀쯤 더 가야 해요. 그래서 보름달에서 다음 보름달까지는 약 29.5일이에요.'
				]
			}
		}
	],
	closing: {
		title: '다음 보름달에서 같은 무늬를 찾아보세요',
		paragraphs: [
			'다시 만난 달토끼가 우리를 바라보고 있다면, 친구 둘레를 걷던 순간을 떠올려 보세요. 우리에게 얼굴을 보여주면서 달은 오늘도 자기 몸을 돌리고 있어요.'
		]
	}
};
