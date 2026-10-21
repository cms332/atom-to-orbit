/** Normalized illustration dimensions. Exactly 100 drawing units equal the stated measurement. */
export interface ScaleArt {
	width: number;
	height: number;
	axis: 'x' | 'y';
	color: string;
	round?: boolean;
	allowOverflow?: boolean;
}
const disc = (color: string): ScaleArt => ({
	width: 100,
	height: 100,
	axis: 'x',
	color,
	round: true
});
export const scaleArt: Record<string, ScaleArt> = {
	atom: { width: 100, height: 100, axis: 'x', color: '#E6BB82' },
	dna: { width: 190, height: 100, axis: 'y', color: '#A2C6C0' },
	virus: disc('#B5A28C'),
	ecoli: { width: 100, height: 43, axis: 'x', color: '#9DB6A0' },
	'red-cell': { width: 100, height: 82, axis: 'x', color: '#BC8778' },
	hair: { width: 250, height: 100, axis: 'y', color: '#BBA685' },
	lead: { width: 240, height: 100, axis: 'y', color: '#7C9196' },
	battery: { width: (100 * 50.5) / 14.5, height: 100, axis: 'y', color: '#B8C5BE' },
	coin: disc('#C0B99F'),
	ball: disc('#EDEDE6'),
	football: disc('#D5DCCF'),
	table: { width: 100, height: 50, axis: 'x', color: '#77A9A8' },
	whale: { width: 100, height: 32, axis: 'x', color: '#81A7B2' },
	iss: { width: 100, height: 74, axis: 'x', color: '#B9C5C2' },
	tower: { width: 18, height: 100, axis: 'y', color: '#98B6B9' },
	phobos: { width: 100, height: (100 * 22) / 27, axis: 'x', color: '#B2A18C' },
	vesta: disc('#ACA99B'),
	moon: disc('#A8B5B1'),
	mercury: disc('#A4AAA2'),
	mars: disc('#BA7F66'),
	venus: disc('#C9B88F'),
	earth: disc('#397987'),
	neptune: disc('#4B819C'),
	uranus: disc('#8DB9B8'),
	saturn: { width: 100, height: 100, axis: 'x', color: '#C3AF87', allowOverflow: true },
	jupiter: disc('#B59878'),
	sun: disc('#D6A16A')
};

/** Camera travels smoothly between catalogue slots; this is presentation spacing, not distance. */
export function cameraSlot(objects: readonly { meters: number }[], exponent: number): number {
	const first = Math.log10(objects[0].meters);
	if (exponent <= first) return 0;
	for (let i = 1; i < objects.length; i++) {
		const right = Math.log10(objects[i].meters);
		if (exponent <= right) {
			const left = Math.log10(objects[i - 1].meters);
			return i - 1 + (exponent - left) / (right - left);
		}
	}
	return objects.length - 1;
}
