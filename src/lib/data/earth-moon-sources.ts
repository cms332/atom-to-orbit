import type { ScienceSource } from './science';

export const lightSpeed = {
	metersPerSecond: 299_792_458,
	sourceId: 'moon-light-speed',
	definition: 'Speed of light in vacuum; exact SI value'
} as const;

export const earthMoonSources: ScienceSource[] = [
	{
		id: 'moon-space-place',
		label: 'NASA Space Place · How Far Away Is the Moon?',
		url: 'https://spaceplace.nasa.gov/moon-distance/en/',
		accessedAt: '2026-10-23',
		basis:
			'어린이를 위한 평균 거리 384,400km, 지구 약 30개 길이, 농구공과 테니스공을 이용한 모형 활동. 달의 궤도는 완전한 원이 아니므로 거리가 변합니다.'
	},
	{
		id: 'moon-jpl-model',
		label: 'NASA/JPL · Modeling the Earth-Moon System',
		url: 'https://www.jpl.nasa.gov/edu/resources/lesson-plan/modeling-the-earth-moon-system/',
		accessedAt: '2026-10-23',
		basis:
			'공으로 지구·달의 크기와 거리를 같은 비율로 줄이는 교육 활동. A2O는 지구 모형 지름을 24cm로 정하고, 기존 NASA 평균 지름·거리를 같은 비율로 환산했습니다. 모든 농구공이나 테니스공의 규격을 뜻하지 않습니다.'
	},
	{
		id: 'moon-webb-light',
		label: 'NASA · How Does Webb See Back in Time?',
		url: 'https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-does-webb-see-back-in-time/',
		accessedAt: '2026-10-23',
		basis:
			'빛은 초당 약 30만km를 이동하며 달빛이 지구에 도착하는 데 약 1.3초가 걸립니다. 이 글은 같은 대표 거리와 빛의 진공 속도로 이동 시간을 계산합니다. 태양에서 달까지의 시간은 이 값에 포함하지 않습니다.'
	},
	{
		id: 'moon-light-speed',
		label: 'NIST · 2022 CODATA, 빛의 진공 속도',
		url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
		accessedAt: '2026-10-23',
		basis: '빛의 진공 속도 c = 299,792,458m/s는 SI 정의에 따른 정확한 값입니다.'
	}
];
