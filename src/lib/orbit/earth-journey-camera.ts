import { eclipticToWorld, type Vec3 } from '$lib/utils/orbit-model';

interface EarthJourneyCamera {
	direction: Vec3;
	up: Vec3;
	portraitUp: Vec3;
	roll: number;
	portraitRoll: number;
	radiusFraction: number;
	radiusCap: number;
}

export const earthJourneyCameras = {
	// Exact camera accepted before the owner's 2026-10-20 side-view experiment.
	'original-close': {
		direction: eclipticToWorld([0.2, -0.35, 1]),
		up: eclipticToWorld([0, 1, 0]),
		portraitUp: eclipticToWorld([0, 1, 0]),
		roll: -0.12,
		portraitRoll: -0.12,
		radiusFraction: 0.28,
		radiusCap: 145
	},
	'oblique-roomy': {
		// Open the travel axis slightly while retaining the receding trail in frame.
		direction: [0.55, 0.45, -0.9],
		up: eclipticToWorld([0, 1, 0]),
		portraitUp: [0, 0, 1],
		roll: -0.12,
		portraitRoll: -0.1,
		radiusFraction: 0.24,
		radiusCap: 125
	}
} satisfies Record<string, EarthJourneyCamera>;

// Keep the owner's preceding composition; the oblique experiment remains recoverable above.
export const activeEarthJourneyCamera: keyof typeof earthJourneyCameras = 'original-close';
export const earthJourneyCamera = earthJourneyCameras[activeEarthJourneyCamera];
