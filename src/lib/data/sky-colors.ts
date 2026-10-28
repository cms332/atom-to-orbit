import type { ScienceSource } from './science';

export const SKY_MODEL = {
	minElevationDeg: 5,
	maxElevationDeg: 80,
	defaultElevationDeg: 70,
	lowElevationDeg: 5,
	referenceWavelengthM: 550e-9,
	illustrativeTau550: 0.1
} as const;

// SI wavelengths. Three representative bands, not RGB primaries or color boundaries.
export const skyBands = [
	{ id: 'blue', label: '파란 계열', wavelengthM: 450e-9, color: '#82c7ed', dash: '9 4' },
	{ id: 'green', label: '초록 계열', wavelengthM: 550e-9, color: '#a6cfaa', dash: '2 4' },
	{ id: 'red', label: '빨간 계열', wavelengthM: 650e-9, color: '#efa77f', dash: '' }
] as const;

function finite(value: number, name: string) {
	if (typeof value !== 'number' || !Number.isFinite(value))
		throw new RangeError(`${name} must be finite`);
}
export function relativeAirmass(elevationDeg: number): number {
	finite(elevationDeg, 'elevation');
	if (elevationDeg < 5 || elevationDeg > 90) throw new RangeError('elevation must be 5–90 degrees');
	return (
		1 / (Math.sin((elevationDeg * Math.PI) / 180) + 0.50572 * (elevationDeg + 6.07995) ** -1.6364)
	);
}
export function relativeRayleigh(
	wavelengthM: number,
	referenceM: number = SKY_MODEL.referenceWavelengthM
): number {
	finite(wavelengthM, 'wavelength');
	finite(referenceM, 'reference wavelength');
	if (wavelengthM <= 0 || referenceM <= 0) throw new RangeError('wavelengths must be positive');
	const factor = (referenceM / wavelengthM) ** 4;
	if (!Number.isFinite(factor)) throw new RangeError('wavelength ratio overflow');
	return factor;
}
export function directTransmission(
	airmass: number,
	wavelengthM: number,
	tau550: number = SKY_MODEL.illustrativeTau550
): number {
	finite(airmass, 'airmass');
	finite(tau550, 'optical depth');
	if (airmass < 0 || tau550 < 0)
		throw new RangeError('airmass and optical depth must be nonnegative');
	const factor = relativeRayleigh(wavelengthM);
	if (airmass === 0 || tau550 === 0) return 1;
	return Math.exp(-tau550 * factor * airmass);
}
export function sampleDirectBeam(elevationDeg: number) {
	const airmass = relativeAirmass(elevationDeg);
	return {
		airmass,
		bands: skyBands.map((band) => ({
			...band,
			transmission: directTransmission(airmass, band.wavelengthM)
		}))
	};
}
export function skyExplanation(elevationDeg: number): string {
	if (elevationDeg >= 50)
		return '햇빛이 비교적 짧은 공기 길을 지나요. 공기에서 흩어진 파란빛 일부가 우리 눈으로 와요.';
	if (elevationDeg <= 15)
		return '햇빛이 더 긴 공기 길을 지나요. 곧장 통과한 빛에는 빨강·주황 계열이 상대적으로 더 많이 남아요.';
	return '태양이 낮아질수록 빛이 지나는 공기 길이 길어져요.';
}

// A fixed, deliberately exaggerated curved air layer. This is illustrative geometry,
// NOT the Kasten–Young atmosphere: no pixel length is presented as airmass or km.
export const skyGeometry = { centerX: 550, centerY: 1470, groundRadius: 1200, airRadius: 1290 };
export function rayGeometry(elevationDeg: number) {
	relativeAirmass(elevationDeg); // same bounded input contract
	const angle = (elevationDeg * Math.PI) / 180;
	const { groundRadius: r, airRadius: outer } = skyGeometry;
	const length = -r * Math.sin(angle) + Math.sqrt((r * Math.sin(angle)) ** 2 + outer ** 2 - r ** 2);
	const at = (distance: number) => ({
		x: 550 - distance * Math.cos(angle),
		y: 270 - distance * Math.sin(angle)
	});
	return {
		entry: at(length),
		sun: at(length + 38),
		scatter: at(length * 0.6),
		target: at(0),
		length
	};
}

export const skySources: ScienceSource[] = [
	{
		id: 'sky-nasa',
		label: 'NASA Space Place · Why Is the Sky Blue?',
		url: 'https://spaceplace.nasa.gov/blue-sky/en/',
		basis: '여러 색이 섞인 햇빛, 파란빛의 산란, 낮은 태양에서 길어지는 공기 통과 경로.'
	},
	{
		id: 'sky-metoffice',
		label: 'Met Office · Why the sky is blue and sunsets red',
		url: 'https://weather.metoffice.gov.uk/learn-about/weather/optical-effects/why-is-the-sky-blue',
		basis: '레이리 산란, 낮하늘과 노을의 연결, 보랏빛의 양과 사람 눈의 반응.'
	},
	{
		id: 'sky-nws',
		label: 'NOAA / National Weather Service · Why Is The Sky Blue?',
		url: 'https://www.weather.gov/fgz/SkyBlue',
		basis: '파장에 따른 산란의 차이와 노을에서 직접 도착하는 빛의 색 구성.'
	},
	{
		id: 'sky-clouds',
		label: 'NOAA JetStream · The Color of Clouds',
		url: 'https://www.noaa.gov/jetstream/clouds/color-of-clouds',
		basis: '구름에 도착하는 햇빛의 색도 구름이 보이는 색에 영향을 줍니다.'
	},
	{
		id: 'sky-safety',
		label: 'NASA Science · Eclipse Viewing Safety',
		url: 'https://science.nasa.gov/eclipses/safety/',
		basis: '태양 직접 관찰의 위험. 이 글의 관찰 대상은 태양 자체가 아닌 주변 하늘과 구름입니다.'
	},
	{
		id: 'sky-ucar',
		label: 'UCAR · Blue Skies and Red Sunsets',
		url: 'https://scied.ucar.edu/activity/blue-skies-and-red-sunsets',
		basis:
			'옆으로 흩어진 빛과 통과한 빛을 구분하는 교육 활동. 이 사이트의 SVG는 A2O가 직접 제작했습니다.'
	},
	{
		id: 'sky-rayleigh',
		label: 'The Feynman Lectures on Physics · Scattering of Light, §32–5',
		url: 'https://www.feynmanlectures.caltech.edu/I_32.html#Ch32-S5',
		basis: '입자가 파장보다 충분히 작은 경우 산란의 파장 의존성은 대략 λ⁻⁴입니다.'
	},
	{
		id: 'sky-airmass',
		label: 'pvlib · Relative airmass / Kasten–Young 1989',
		url: 'https://pvlib-python.readthedocs.io/en/stable/reference/generated/pvlib.atmosphere.get_relative_airmass.html',
		basis:
			'겉보기 태양 높이로 상대 공기량을 계산하는 공식과 공식 구현을 대조했습니다. 조작 범위는 5°–80°입니다.'
	},
	{
		id: 'sky-airmass-paper',
		label: 'Kasten & Young (1989) · Revised optical air mass tables and approximation formula',
		url: 'https://doi.org/10.1364/AO.28.004735',
		basis:
			'pvlib 문서가 제시한 원 논문 식별자입니다. 이 작업에서는 pvlib의 문서와 공개 구현을 검증에 사용했으며 논문 전문을 열람한 것으로 표시하지 않습니다.'
	}
].map((source) => ({ ...source, accessedAt: '2026-10-28' }));
