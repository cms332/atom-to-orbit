import { objects } from '../data/science';

export const MIN_EXPONENT = -10;
export const MAX_METERS = objects.find((object) => object.id === 'sun')!.meters;
export const MAX_EXPONENT = Math.log10(MAX_METERS);
export function toPosition(meters: number): number {
	if (!Number.isFinite(meters) || meters <= 0)
		throw new RangeError('meters must be positive and finite');
	return (Math.log10(meters) - MIN_EXPONENT) / (MAX_EXPONENT - MIN_EXPONENT);
}
export function fromPosition(position: number): number {
	if (!Number.isFinite(position)) throw new RangeError('position must be finite');
	return 10 ** (MIN_EXPONENT + position * (MAX_EXPONENT - MIN_EXPONENT));
}
export function nearestObject<T extends { meters: number }>(
	items: readonly T[],
	exponent: number
): T {
	if (!items.length || !Number.isFinite(exponent))
		throw new RangeError('valid items and exponent required');
	return items.reduce((best, item) =>
		Math.abs(Math.log10(item.meters) - exponent) < Math.abs(Math.log10(best.meters) - exponent)
			? item
			: best
	);
}
const superscripts: Record<string, string> = {
	'-': '⁻',
	'0': '⁰',
	'1': '¹',
	'2': '²',
	'3': '³',
	'4': '⁴',
	'5': '⁵',
	'6': '⁶',
	'7': '⁷',
	'8': '⁸',
	'9': '⁹'
};
export function power(exponent: number): string {
	return String(exponent)
		.split('')
		.map((c) => superscripts[c] ?? c)
		.join('');
}
export function scientific(meters: number): string {
	toPosition(meters);
	let exponent = Math.floor(Math.log10(meters));
	let coefficient = Number((meters / 10 ** exponent).toPrecision(3));
	if (coefficient === 10) {
		coefficient = 1;
		exponent += 1;
	}
	return `${coefficient} × 10${power(exponent)} m`;
}
export function converted(meters: number, significantDigits = 7): string {
	toPosition(meters);
	const [factor, unit] =
		meters >= 1000
			? ([1000, 'km'] as const)
			: meters < 1e-6
				? ([1e-9, 'nm'] as const)
				: meters < 1e-3
					? ([1e-6, 'μm'] as const)
					: meters < 1
						? ([1e-3, 'mm'] as const)
						: ([1, 'm'] as const);
	return `${new Intl.NumberFormat('ko-KR', { maximumSignificantDigits: meters < 1e-6 ? Math.min(3, significantDigits) : significantDigits }).format(meters / factor)} ${unit}`;
}
export function objectLength(object: { meters: number; displayDigits?: number }): string {
	return converted(object.meters, object.displayDigits);
}
