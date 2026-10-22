import { additionalObjects, additionalSources } from './science-expansion';
import { planetObjects, planetSources } from './science-planets';
import { motionSources } from './motion';
import { BOHR_RADIUS, atomicSpaceSources } from './atomic-space';
import { earthMoonSources } from './earth-moon-sources';
export { BOHR_RADIUS } from './atomic-space';
export type DimensionKind = 'diameter' | 'length' | 'height' | 'distance';
export type ApproximationKind =
	'approximate' | 'mean' | 'standard' | 'representative' | 'maximum' | 'nominal';
export interface ScienceSource {
	id: string;
	label: string;
	url: string;
	accessedAt: string;
	basis: string;
}
export interface ScaleObject {
	id: string;
	nameKo: string;
	nameEn: string;
	meters: number;
	dimensionKind: DimensionKind;
	approximation: ApproximationKind;
	measurement: string;
	briefKo: string;
	sourceId: string;
	derivation: string;
	articleSlug?: string;
	rangeMeters?: readonly [number, number];
	displayDigits?: number;
}
const nasa = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
export const sources: ScienceSource[] = [
	{
		id: 'nist',
		label: 'NIST · 2022 CODATA',
		url: 'https://physics.nist.gov/cuu/pdf/wall_2022.pdf',
		accessedAt: '2026-10-19',
		basis: '보어 반지름 a₀ = 5.291 772 105 44 × 10⁻¹¹ m. 표시에는 유효숫자 3자리를 사용합니다.'
	},
	{
		id: 'ittf',
		label: 'ITTF · Statutes 2025, §2.1.1 · §2.3.1',
		url: 'https://db.ittf.com/sites/default/files/public/2025-02/2025_ITTF_Statutes_clean_version.pdf',
		accessedAt: '2026-10-19',
		basis:
			'2025판에 명시된 공 지름 40 mm와 탁구대 길이 2.74 m를 규격 예시로 사용합니다. 개별 제품의 실측값이 아닙니다.'
	},
	{
		id: 'moon',
		label: 'NASA · Moon Fact Sheet',
		url: nasa + 'moonfact.html',
		accessedAt: '2026-10-19',
		basis: '체적 평균 반지름 1,737.4 km. 궤도 긴반지름 384,400 km.'
	},
	{
		id: 'atomic-radius-definitions',
		label: 'OpenStax · Chemistry 2e, 6.5 원자 반지름을 정하는 방법',
		url: 'https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties',
		accessedAt: '2026-10-23',
		basis:
			'원자에는 하나의 명확한 가장자리가 없어 반지름을 정하는 실용적인 기준이 여럿 있습니다. 공유 반지름은 결합한 같은 원자 두 개의 핵 사이 거리의 절반으로 정의합니다. 이 글의 2a₀는 비교용 기준 길이이며, 이러한 모든 원자 반지름 정의를 대체하지 않습니다.'
	},
	{
		id: 'nano-units',
		label: 'NNCO · Just How Small Is Nano?',
		url: 'https://www.nano.gov/about-nanotechnology/just-how-small-is-nano/',
		accessedAt: '2026-10-23',
		basis:
			'SI 접두어 nano는 10억분의 1을 뜻합니다. 1nm = 10⁻⁹m입니다. 본문은 익숙한 길이를 먼저 비교한 뒤 이 단위를 소개합니다.'
	},
	{
		id: 'earth',
		label: 'NASA · Earth Fact Sheet',
		url: nasa + 'earthfact.html',
		accessedAt: '2026-10-19',
		basis: '체적 평균 반지름 6,371 km. 적도 반지름과 구분합니다.'
	},
	{
		id: 'jupiter',
		label: 'NASA · Jupiter Fact Sheet',
		url: nasa + 'jupiterfact.html',
		accessedAt: '2026-10-19',
		basis: '체적 평균 반지름 69,911 km. 대기의 1 bar 수준을 기준으로 합니다.'
	},
	{
		id: 'sun',
		label: 'NASA · Sun Fact Sheet',
		url: nasa + 'sunfact.html',
		accessedAt: '2026-10-19',
		basis: '체적 평균 반지름 695,700 km.'
	},
	{
		id: 'earth-facts',
		label: 'NASA Science · Earth Facts',
		url: 'https://science.nasa.gov/earth/facts/',
		accessedAt: '2026-10-19',
		basis: '지구–달 평균 거리 384,400 km. 시간에 따라 달라지는 거리의 대표값입니다.'
	},
	...additionalSources,
	...planetSources,
	...motionSources,
	...atomicSpaceSources,
	...earthMoonSources
];
export function sourceById(id: string): ScienceSource {
	const source = sources.find((s) => s.id === id);
	if (!source) throw new Error(`Unknown source: ${id}`);
	return source;
}
export const EARTH_MOON_METERS = 384_400_000;
const originalObjects: ScaleObject[] = [
	{
		id: 'atom',
		nameKo: '원자 규모의 기준 길이',
		nameEn: 'ATOMIC SCALE',
		meters: 2 * BOHR_RADIUS,
		dimensionKind: 'length',
		approximation: 'approximate',
		measurement: '보어 반지름의 2배 · 2a₀',
		briefKo:
			'수소 원자 모형의 기준 길이인 보어 반지름을 두 배 한 값입니다. 모든 원자의 지름이나 원자의 단단한 경계를 뜻하지 않습니다.',
		sourceId: 'nist',
		derivation: '2 × 5.29177210544 × 10⁻¹¹ m',
		articleSlug: 'atomic-scale'
	},
	{
		id: 'ball',
		nameKo: '탁구공',
		nameEn: 'TABLE TENNIS BALL',
		meters: 0.04,
		dimensionKind: 'diameter',
		approximation: 'standard',
		measurement: '규격 지름',
		briefKo:
			'손안의 익숙한 크기입니다. ITTF 2025 규정의 지름 40 mm를 기준으로 삼았습니다. 규격값과 개별 공의 실측값은 구분해야 합니다.',
		sourceId: 'ittf',
		derivation: '40 mm ÷ 1,000 = 0.04 m',
		articleSlug: 'atomic-scale'
	},
	{
		id: 'table',
		nameKo: '탁구대',
		nameEn: 'TABLE TENNIS TABLE',
		meters: 2.74,
		dimensionKind: 'length',
		approximation: 'standard',
		measurement: '경기면의 긴 변 길이',
		briefKo:
			'탁구대 경기면의 긴 변입니다. 너비나 높이가 아닌 길이 2.74 m를 표시합니다. ITTF 2025판의 규격 예시입니다.',
		sourceId: 'ittf',
		derivation: '2.74 m'
	},
	{
		id: 'moon',
		nameKo: '달',
		nameEn: 'MOON',
		meters: 3_474_800,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'같은 부피의 구로 환산한 평균 반지름의 두 배입니다. 달까지의 거리가 아니라 달 자체의 크기입니다.',
		sourceId: 'moon',
		derivation: '1,737.4 km × 2 × 1,000',
		articleSlug: 'earth-moon'
	},
	{
		id: 'earth',
		nameKo: '지구',
		nameEn: 'EARTH',
		meters: 12_742_000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'지구는 완전한 구가 아닙니다. 같은 부피의 구로 환산한 평균 반지름 6,371 km를 두 배 하여 크기를 비교합니다.',
		sourceId: 'earth',
		derivation: '6,371 km × 2 × 1,000',
		articleSlug: 'earth-moon'
	},
	{
		id: 'jupiter',
		nameKo: '목성',
		nameEn: 'JUPITER',
		meters: 139_822_000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름 · 1 bar 기준',
		briefKo:
			'목성의 기준 표면은 대기 압력 1 bar 수준입니다. 적도와 극의 반지름이 달라 체적 평균값으로 통일했습니다.',
		sourceId: 'jupiter',
		derivation: '69,911 km × 2 × 1,000'
	},
	{
		id: 'sun',
		nameKo: '태양',
		nameEn: 'SUN',
		meters: 1_391_400_000,
		dimensionKind: 'diameter',
		approximation: 'mean',
		measurement: '체적 평균 지름',
		briefKo:
			'NASA 자료의 체적 평균 반지름을 두 배 한 값입니다. 지구에서 태양까지의 거리와 구별해서 읽어 주세요.',
		sourceId: 'sun',
		derivation: '695,700 km × 2 × 1,000'
	}
];
export const objects: ScaleObject[] = [
	...originalObjects,
	...additionalObjects,
	...planetObjects
].sort((a, b) => a.meters - b.meters);
export const dimensions: Record<DimensionKind, string> = {
	diameter: '지름',
	length: '길이',
	height: '높이',
	distance: '거리'
};
export const qualifications: Record<ApproximationKind, string> = {
	approximate: '근삿값',
	mean: '평균값',
	standard: '규격값',
	representative: '대표 예시',
	maximum: '최댓값 기준',
	nominal: '명목 규격'
};
