import { objects } from '$lib/data/science';
import { MAX_EXPONENT, MIN_EXPONENT, nearestObject } from './scales';

export const DEFAULT_EXPONENT = Math.log10(objects.find((object) => object.id === 'earth')!.meters);

/** URL state can move the existing axis, but never introduces scientific measurements. */
export function readExplorerExponent(params: URLSearchParams): number {
	const object = objects.find((item) => item.id === params.get('object'));
	const cursor = params.get('at');
	if (cursor !== null && cursor.trim() !== '') {
		const exponent = Number(cursor);
		if (Number.isFinite(exponent) && exponent >= MIN_EXPONENT && exponent <= MAX_EXPONENT) {
			return exponent === MAX_EXPONENT ? MAX_EXPONENT : Number(exponent.toFixed(2));
		}
	}
	return object ? Math.log10(object.meters) : DEFAULT_EXPONENT;
}

export function explorerUrl(current: URL, exponent: number): URL {
	if (!Number.isFinite(exponent) || exponent < MIN_EXPONENT || exponent > MAX_EXPONENT) {
		throw new RangeError('exponent must be within the explorer axis');
	}
	const url = new URL(current);
	const object = nearestObject(objects, exponent);
	url.searchParams.set('object', object.id);
	if (Math.abs(Math.log10(object.meters) - exponent) < 1e-9) url.searchParams.delete('at');
	else url.searchParams.set('at', String(Number(exponent.toFixed(2))));
	url.hash = '';
	return url;
}
