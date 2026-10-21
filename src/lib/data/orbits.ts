/** JPL Table 1: a(AU), e, I, L, longitude of perihelion, ascending node.
 * Each pair is the J2000 value and its rate per Julian century.
 */
export type ElementPair = readonly [number, number];
export interface OrbitPlanet {
	id: string;
	name: string;
	color: string;
	semiMajorAxisMeters: number;
	sourceId: 'jpl-orbits';
	a: ElementPair;
	e: ElementPair;
	i: ElementPair;
	l: ElementPair;
	peri: ElementPair;
	node: ElementPair;
}
export const AU_METERS = 149_597_870_700;
export const YEAR_DAYS = 365.25;
export const YEAR_SECONDS = YEAR_DAYS * 86400;
export const SOLAR_SPEED_KM_S = 230;
export const MAX_ORBIT_YEARS = 40;
export const EMPHASIZED_SPEED = 0.05;
const jplElements: Omit<OrbitPlanet, 'semiMajorAxisMeters' | 'sourceId'>[] = [
	{
		id: 'mercury',
		name: '수성',
		color: '#C5B7A2',
		a: [0.38709927, 0.00000037],
		e: [0.20563593, 0.00001906],
		i: [7.00497902, -0.00594749],
		l: [252.2503235, 149472.67411175],
		peri: [77.45779628, 0.16047689],
		node: [48.33076593, -0.12534081]
	},
	{
		id: 'venus',
		name: '금성',
		color: '#DEBF83',
		a: [0.72333566, 0.0000039],
		e: [0.00677672, -0.00004107],
		i: [3.39467605, -0.0007889],
		l: [181.9790995, 58517.81538729],
		peri: [131.60246718, 0.00268329],
		node: [76.67984255, -0.27769418]
	},
	{
		id: 'earth',
		name: '지구',
		color: '#7DBBC5',
		a: [1.00000261, 0.00000562],
		e: [0.01671123, -0.00004392],
		i: [-0.00001531, -0.01294668],
		l: [100.46457166, 35999.37244981],
		peri: [102.93768193, 0.32327364],
		node: [0, 0]
	},
	{
		id: 'mars',
		name: '화성',
		color: '#D98D72',
		a: [1.52371034, 0.00001847],
		e: [0.0933941, 0.00007882],
		i: [1.84969142, -0.00813131],
		l: [-4.55343205, 19140.30268499],
		peri: [-23.94362959, 0.44441088],
		node: [49.55953891, -0.29257343]
	},
	{
		id: 'jupiter',
		name: '목성',
		color: '#DBAC89',
		a: [5.202887, -0.00011607],
		e: [0.04838624, -0.00013253],
		i: [1.30439695, -0.00183714],
		l: [34.39644051, 3034.74612775],
		peri: [14.72847983, 0.21252668],
		node: [100.47390909, 0.20469106]
	},
	{
		id: 'saturn',
		name: '토성',
		color: '#E3D1A4',
		a: [9.53667594, -0.0012506],
		e: [0.05386179, -0.00050991],
		i: [2.48599187, 0.00193609],
		l: [49.95424423, 1222.49362201],
		peri: [92.59887831, -0.41897216],
		node: [113.66242448, -0.28867794]
	},
	{
		id: 'uranus',
		name: '천왕성',
		color: '#A2CCC3',
		a: [19.18916464, -0.00196176],
		e: [0.04725744, -0.00004397],
		i: [0.77263783, -0.00242939],
		l: [313.23810451, 428.48202785],
		peri: [170.9542763, 0.40805281],
		node: [74.01692503, 0.04240589]
	},
	{
		id: 'neptune',
		name: '해왕성',
		color: '#91AEE1',
		a: [30.06992276, 0.00026291],
		e: [0.00859048, 0.00005105],
		i: [1.77004347, 0.00035372],
		l: [-55.12002969, 218.45945325],
		peri: [44.96476227, -0.32241464],
		node: [131.78422574, -0.00508664]
	}
];
export const orbitPlanets: readonly OrbitPlanet[] = jplElements.map((planet) => ({
	...planet,
	semiMajorAxisMeters: planet.a[0] * AU_METERS,
	sourceId: 'jpl-orbits'
}));
export const orbitSources = [
	{
		label: 'NASA / JPL · 행성의 근사 위치와 궤도요소',
		url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
		note: 'J2000 황도 기준, Table 1. 지구는 지구–달 질량중심 근사.'
	},
	{
		label: 'NASA · 태양계의 은하 공전',
		url: 'https://science.nasa.gov/solar-system/solar-system-facts/',
		note: '약 828,000 km/h = 230 km/s. 이 체험은 국부 등속 이동 근사.'
	},
	{
		label: 'IAU · 천문단위의 정의',
		url: 'https://iauarchive.eso.org/public/themes/measuring/',
		note: '1 AU = 149,597,870,700 m.'
	},
	{
		label: 'Astropy · 천문 좌표계',
		url: 'https://docs.astropy.org/en/stable/coordinates/',
		note: '황도·적도·은하 좌표의 구분과 좌표 변환.'
	},
	{
		label: 'ERFA · ICRS–은하 회전 상수',
		url: 'https://github.com/liberfa/erfa/blob/master/src/icrs2g.c',
		note: 'Hipparcos 기준의 은하 회전행렬. 수치 상수만 사용하며 라이선스 고지를 보존합니다.'
	}
] as const;
