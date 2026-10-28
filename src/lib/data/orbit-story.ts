import type { OrbitFrame } from '$lib/utils/orbit-model';
export type CameraView =
	| 'earth'
	| 'inner'
	| 'overview'
	| 'top'
	| 'trail'
	| 'journey'
	| 'formation'
	| 'companions'
	| 'earth-journey'
	| 'solar-front';
export const orbitChapters: {
	title: string;
	text: string;
	takeaway: string;
	frame: OrbitFrame;
	factor: number;
	view: CameraView;
	motionRate?: number;
}[] = [
	{
		title: '우리의 집 지구',
		text: '지구는 오늘도 우리를 태우고 태양 둘레를 돌고 있습니다. 멈춰 선 듯한 지금 이 순간에도, 우리의 우주 여행은 계속되고 있습니다.',
		takeaway: '우리의 출발점은 지구입니다.',
		frame: 'solar',
		factor: 0.05,
		view: 'earth'
	},
	{
		title: '곁을 지나는 이웃들',
		text: '가까운 수성은 서둘러 태양을 돌고, 먼 행성들은 느긋하게 한 바퀴를 이어갑니다. 저마다의 걸음으로, 같은 태양 곁을 여행합니다.',
		takeaway: '다른 속도로, 같은 태양 곁을 갑니다.',
		frame: 'solar',
		factor: 0.05,
		view: 'top',
		motionRate: 1 / 1.5
	},
	{
		title: '태양과 함께, 은하 속으로',
		text: '조금 더 멀리 시선을 옮겨 볼까요. 태양도 우리와 함께 은하 속을 여행합니다. 화면의 선은 보이지 않는 이동 경로를 이해하기 쉽게 그린 것입니다.',
		takeaway: '태양계도 은하 속을 움직입니다.',
		frame: 'galactic',
		factor: 0.05,
		view: 'trail'
	},
	{
		title: '태양계의 다정한 동행',
		text: '우리의 길은 한 줄로 가지런하지 않습니다. 지구와 이웃 행성들은 태양의 앞과 옆을 오가며 저마다의 길을 그립니다. 함께 움직여도, 매 순간의 풍경은 달라집니다.',
		takeaway: '행성들은 태양 뒤에 한 줄로 따라붙지 않습니다.',
		frame: 'galactic',
		factor: 0.05,
		view: 'journey'
	},
	{
		title: '멀리까지 이어지는 발자취',
		text: '멀리서 바라본 우리의 길은 길고 가느다랗습니다. 그 안에서도 지구는 태양 곁을 돌고 있습니다. 우리는 그 작고 푸른 세계에 올라, 은하 속으로 함께 나아갑니다.',
		takeaway: '멀리서 보이는 긴 길 안에도 지구의 한 바퀴가 있습니다.',
		frame: 'galactic',
		factor: 1,
		view: 'trail'
	},
	{
		title: '지구는 꿈을 싣고',
		text: '다시 우리의 지구를 바라보세요. 지구에서 살아가는 모든 존재의 삶과 꿈을 싣고 지금도 고요한 여정을 이어가고 있습니다.',
		takeaway: '지구에서의 일상도 우주 여행의 한순간입니다.',
		frame: 'galactic',
		factor: 0.05,
		view: 'earth-journey',
		motionRate: 0.8 / 1.5
	}
];
