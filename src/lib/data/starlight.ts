import { lightSpeed } from './earth-moon-sources';
import type { ScienceSource } from './science';

export const LIGHT_SPEED_M_S = lightSpeed.metersPerSecond;
export const JULIAN_YEAR_SECONDS = 365.25 * 86_400;
export const LIGHT_YEAR_M = LIGHT_SPEED_M_S * JULIAN_YEAR_SECONDS;
export const LIGHT_ANIMATION_MS = 3_000;

export interface LightTarget {
	id: string;
	name: string;
	kind: '위성' | '별' | '은하';
	distanceM: number;
	distanceLabel: string;
	timeLabel: string;
	note: string;
	sourceIds: string[];
}

// Representative distances, not live positions. Display rounding never enters the calculation.
export const lightTargets: readonly LightTarget[] = [
	{
		id: 'moon',
		name: '달',
		kind: '위성',
		distanceM: 384_400_000,
		distanceLabel: '약 38만 4,400km',
		timeLabel: '약 1.3초',
		note: '달에서 반사된 태양빛이 지구로 오는 시간이에요. 태양에서 달까지 온 시간은 따로 있어요.',
		sourceIds: ['starlight-moon', 'starlight-moonlight']
	},
	{
		id: 'sun',
		name: '태양',
		kind: '별',
		distanceM: 149_597_870_700,
		distanceLabel: '약 1억 5천만km',
		timeLabel: '약 8분 20초',
		note: '태양 표면 부근을 떠난 빛이 지구까지 오는 시간이에요. 태양은 눈으로 직접 바라보지 마세요.',
		sourceIds: ['starlight-jpl', 'starlight-sun']
	},
	{
		id: 'proxima',
		name: '프록시마 센타우리',
		kind: '별',
		distanceM: 4.24 * LIGHT_YEAR_M,
		distanceLabel: '약 4.2광년',
		timeLabel: '약 4.2년',
		note: '태양 다음으로 지구에 가까운 별이에요. 하지만 아주 어두워서 맨눈으로는 볼 수 없어요.',
		sourceIds: ['starlight-proxima', 'starlight-proxima-view']
	},
	{
		id: 'sirius',
		name: '시리우스',
		kind: '별',
		distanceM: 8.6 * LIGHT_YEAR_M,
		distanceLabel: '약 8.6광년',
		timeLabel: '약 8.6년',
		note: '지금 열 살인 어린이가 본다면, 한 살쯤이었을 때 출발한 빛을 만나는 셈이에요.',
		sourceIds: ['starlight-sirius']
	},
	{
		id: 'andromeda',
		name: '안드로메다은하',
		kind: '은하',
		distanceM: 2_500_000 * LIGHT_YEAR_M,
		distanceLabel: '약 250만 광년',
		timeLabel: '약 250만 년',
		note: '별 하나가 아니라 수많은 별이 모인 은하예요. 우리 가족의 기억보다 훨씬 오래된 빛이지요.',
		sourceIds: ['starlight-andromeda']
	}
];

export function clampLightProgress(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}
export function lightTravelSeconds(target: LightTarget, progress = 1): number {
	return (target.distanceM / LIGHT_SPEED_M_S) * clampLightProgress(progress);
}
export function lightElapsedLabel(target: LightTarget, progress: number): string {
	const seconds = lightTravelSeconds(target, progress);
	if (target.distanceM >= LIGHT_YEAR_M) {
		const years = seconds / JULIAN_YEAR_SECONDS;
		return years >= 10_000
			? `${(years / 10_000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만 년`
			: `${years.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}년`;
	}
	if (target.id === 'sun') {
		const rounded = Math.round(seconds);
		return `${Math.floor(rounded / 60)}분 ${rounded % 60}초`;
	}
	return `${seconds.toFixed(1)}초`;
}

export const starlightSources: ScienceSource[] = [
	{
		id: 'starlight-lightyear',
		label: 'NASA Space Place · What Is a Light-Year?',
		url: 'https://spaceplace.nasa.gov/light-year/en/',
		basis:
			'광년은 빛이 1년 동안 가는 거리입니다. 본문은 어린이용 설명을 참고해 A2O에서 작성했습니다.'
	},
	{
		id: 'starlight-webb',
		label: 'NASA Webb · How Does Webb See Back in Time?',
		url: 'https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-does-webb-see-back-in-time/',
		basis:
			'달빛의 이동 시간 약 1.3초와 먼 천체를 볼 때 과거의 모습을 보는 이유. 망원경은 과거로 이동하거나 원하는 시점을 다시 재생하는 장치가 아닙니다.'
	},
	{
		id: 'starlight-c',
		label: 'NIST · Speed of light in vacuum',
		url: 'https://physics.nist.gov/cuu/Constants/Value/c.html',
		basis: '빛의 진공 속도 c = 299,792,458m/s, 정확한 SI 정의값.'
	},
	{
		id: 'starlight-jpl',
		label: 'NASA/JPL · Astrodynamic Parameters',
		url: 'https://ssd.jpl.nasa.gov/astro_par.html',
		basis:
			'1AU = 149,597,870,700m. 율리우스년은 365.25일, 하루는 86,400초. 1AU의 광행시간은 약 499.005초이며 본문에서는 약 8분 20초로 둥글려 표시합니다.'
	},
	{
		id: 'starlight-moon',
		label: 'NASA Space Place · How Far Away Is the Moon?',
		url: 'https://spaceplace.nasa.gov/moon-distance/en/',
		basis: '지구와 달의 평균 거리 384,400km. 달의 실제 거리는 공전하며 달라집니다.'
	},
	{
		id: 'starlight-moonlight',
		label: 'NASA · Moonlight',
		url: 'https://science.nasa.gov/moon/moonlight/',
		basis:
			'달빛은 달에서 반사된 태양빛입니다. 이 글의 1.3초는 반사 이후 달에서 지구까지의 시간입니다.'
	},
	{
		id: 'starlight-proxima',
		label: 'Observatoire de Paris · Proxima bound to Alpha Centauri',
		url: 'https://observatoiredeparis.psl.eu/proxima-bound-to-alpha.html',
		basis:
			'프록시마 센타우리의 대표 거리 4.24광년. 체험의 표시값은 약 4.2광년·4.2년이며 내부 계산은 4.24광년을 사용합니다.'
	},
	{
		id: 'starlight-proxima-view',
		label: 'NASA Hubble · Proxima Centauri',
		url: 'https://science.nasa.gov/asset/hubble/proxima-centauri/',
		basis: '태양을 제외하면 가장 가까운 별이며, 맨눈으로 보이지 않을 만큼 어두운 적색왜성입니다.'
	},
	{
		id: 'starlight-sirius',
		label: 'NASA Hubble · The Dog Star, Sirius, and its Tiny Companion',
		url: 'https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/',
		basis:
			'시리우스 A의 대표 거리 약 8.6광년. 열 살에서 8.6년을 빼면 약 1.4살이며, 본문은 한 살쯤이라고 표현했습니다.'
	},
	{
		id: 'starlight-andromeda',
		label: 'NASA Hubble · Hidden History of Andromeda Galaxy',
		url: 'https://science.nasa.gov/missions/hubble/nasas-hubble-traces-hidden-history-of-andromeda-galaxy/',
		basis:
			'수많은 별로 이루어진 안드로메다은하의 대표 거리 약 250만 광년. 먼 우주 전반의 정밀한 우주론적 거리 계산에 적용하는 모형은 아닙니다.'
	},
	{
		id: 'starlight-sun',
		label: 'NASA · Our Sun: Facts',
		url: 'https://science.nasa.gov/sun/facts/',
		basis:
			'태양은 별입니다. 이 글의 약 8분 20초는 태양 표면 부근에서 지구까지의 이동 시간으로, 중심에서 만들어진 에너지가 표면에 이르는 과정은 포함하지 않습니다. 태양을 직접 바라보지 않도록 안내합니다.'
	}
].map((source) => ({ ...source, accessedAt: '2026-10-28' }));
