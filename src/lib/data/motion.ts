import type { ScienceSource } from './science';
import { SOLAR_SPEED_KM_S } from './orbits';

export interface MotionMeasurement {
	id: string;
	name: string;
	metersPerSecond: number;
	displayValue: string;
	displayUnit: 'km/h' | 'km/s';
	frame: string;
	note: string;
	sourceId: string;
}

export const motionMeasurements: readonly MotionMeasurement[] = [
	{
		id: 'rotation',
		name: '지구 자전',
		metersPerSecond: 1670 / 3.6,
		displayValue: '1,670',
		displayUnit: 'km/h',
		frame: '적도 지표면 기준',
		note: '지구의 가운데를 두르는 적도에서 잰 값이에요. 다른 위치에서는 달라져요.',
		sourceId: 'motion-rotation'
	},
	{
		id: 'orbit',
		name: '지구 공전',
		metersPerSecond: 29_780,
		displayValue: '29.78',
		displayUnit: 'km/s',
		frame: '태양 기준 · 평균',
		note: '지구가 태양 둘레를 도는 빠르기예요. 도는 동안 조금씩 달라져요.',
		sourceId: 'motion-orbit'
	},
	{
		id: 'galaxy',
		name: '태양계의 은하 공전',
		metersPerSecond: SOLAR_SPEED_KM_S * 1000,
		displayValue: String(SOLAR_SPEED_KM_S),
		displayUnit: 'km/s',
		frame: '우리은하의 중심 기준 · 대표값',
		note: '은하는 수많은 별이 모인 거대한 무리예요.',
		sourceId: 'motion-galaxy'
	}
];

export function hourlySpeedLabel(item: MotionMeasurement): string {
	const kilometersPerHour = item.metersPerSecond * 3.6;
	// Round the orbital value (107,208km/h) for the elementary reading level.
	const rounded =
		item.id === 'orbit'
			? Math.round(kilometersPerHour / 1000) * 1000
			: Math.round(kilometersPerHour);
	return rounded.toLocaleString('en-US');
}

export const tenSecondTravelMeters = SOLAR_SPEED_KM_S * 1000 * 10;

export const motionSources: ScienceSource[] = [
	{
		id: 'motion-rotation',
		label: 'NASA · Webb Launch',
		url: 'https://science.nasa.gov/mission/webb/launch/',
		accessedAt: '2026-10-21',
		basis: 'Location 절: 적도 지표면의 자전 선속도 1,670 km/h. 위도에 따라 달라지는 값입니다.'
	},
	{
		id: 'motion-orbit',
		label: 'NASA · Earth Fact Sheet',
		url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
		accessedAt: '2026-10-21',
		basis:
			'태양 중심 평균 공전 속도 29.78 km/s. 최솟값 29.29 km/s, 최댓값 30.29 km/s로 타원 궤도에서 변합니다. 체적 평균 반지름 6,371km의 두 배인 평균 지름 12,742km를 거리 비교에 사용합니다.'
	},
	{
		id: 'motion-galaxy',
		label: 'NASA · Solar System Facts',
		url: 'https://science.nasa.gov/solar-system/solar-system-facts/',
		accessedAt: '2026-10-21',
		basis:
			'은하 중심 주위 공전 속도 약 828,000 km/h = 230 km/s, 주기 약 2억 3천만 년. 대표 근삿값입니다.'
	},
	{
		id: 'motion-inertia',
		label: 'ESA · Space Science FAQ',
		url: 'https://www.esa.int/Science_Exploration/Space_Science/Frequently_asked_questions',
		accessedAt: '2026-10-21',
		basis: '행성이 태양을 도는 이유: 관성과 중력이 함께 작용하며 운동 방향을 계속 바꿉니다.'
	},
	{
		id: 'motion-freefall',
		label: 'NASA · Gravity & Mechanics',
		url: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/',
		accessedAt: '2026-10-21',
		basis:
			'How Orbits Work / Freefall: 궤도 운동도 중력 아래 계속 떨어지는 자유낙하로 설명할 수 있습니다.'
	},
	{
		id: 'motion-pendulum',
		label: 'Smithsonian · Foucault Pendulum',
		url: 'https://amhistory.si.edu/documentsgallery/exhibitions/50th/8.html',
		accessedAt: '2026-10-21',
		basis:
			'푸코 진자가 지구 자전을 보여주는 원리와 스미스소니언의 과거 전시 기록. 현재 전시 중이라는 뜻은 아닙니다.'
	},
	{
		id: 'motion-coriolis',
		label: 'NOAA · What Is the Coriolis Effect?',
		url: 'https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-the-coriolis-effect',
		accessedAt: '2026-10-21',
		basis: '지구 자전과 위도에 따른 선속도 차이, 대기와 장거리 이동에서 관측되는 코리올리 효과.'
	},
	{
		id: 'motion-rotation-sense',
		label: 'NASA · Cosmicopia: Why Can’t I Feel the Earth Turning?',
		url: 'https://cosmicopia.gsfc.nasa.gov/qa_gp_ev.html',
		accessedAt: '2026-10-21',
		basis:
			'지구 자전의 효과는 작고 지속적이며, 우리 주변도 함께 회전합니다. 자전을 체감하기 어려운 이유를 설명합니다.'
	},
	{
		id: 'motion-tides',
		label: 'NOAA · What Causes Tides?',
		url: 'https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html',
		accessedAt: '2026-10-21',
		basis:
			'태양과 달의 중력이 만드는 조석 효과. 천체까지의 거리 차이에 따라 중력과 조석력이 달라집니다.'
	},
	{
		id: 'motion-jpl',
		label: 'NASA / JPL · Approximate Positions of the Planets',
		url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
		accessedAt: '2026-10-21',
		basis:
			'Table 1의 J2000 궤도요소와 변화율. 기사 도식과 탐험기는 같은 계산을 사용하며 지구는 지구–달 질량중심으로 근사합니다.'
	},
	{
		id: 'motion-earth-for-kids',
		label: 'NASA · What Is Earth? (Grades K-4)',
		url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-earth-grades-k-4/',
		accessedAt: '2026-10-23',
		basis:
			'지구가 자전하며 약 하루에 한 바퀴 돌고, 약 1년에 태양 둘레를 한 바퀴 공전한다는 어린이용 설명입니다.'
	},
	{
		id: 'motion-orbit-for-kids',
		label: 'NASA · What Is an Orbit? (Grades K-4)',
		url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-an-orbit-grades-k-4/',
		accessedAt: '2026-10-23',
		basis:
			'궤도는 다른 천체 둘레를 도는 길입니다. 움직임을 이어가려는 성질과 중력이 길을 휘어지게 하는 역할을 쉬운 말로 설명합니다.'
	},
	{
		id: 'motion-microgravity-for-kids',
		label: 'NASA · What Is Microgravity? (Grades 5-8)',
		url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-microgravity-grades-5-8/',
		accessedAt: '2026-10-23',
		basis:
			'중력은 우주에서도 작용합니다. 우주선·사람·물체가 중력 아래 함께 떨어지는 운동으로 무게를 느끼는 방식이 달라짐을 설명합니다. 이 글은 그 원리를 지구와 몸이 태양 중력 아래 거의 함께 공전한다는 설명에 참고합니다.'
	}
];
