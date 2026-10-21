import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { createStarfield, createSurfaces, displayRadii } from './surfaces';
import { CAMERA_TRANSITION_MS } from './timing';
import { createTrackingTrail } from './tracking-trail';
import { trailVisibility } from './trail-visibility';
import { guardOrbitGestures } from './gesture-lifecycle';
import { earthJourneyCamera, activeEarthJourneyCamera } from './earth-journey-camera';
import type { TrailProjection } from './refine-trail';
import { orbitPlanets, MAX_ORBIT_YEARS, EMPHASIZED_SPEED } from '$lib/data/orbits';
import type { CameraView } from '$lib/data/orbit-story';
import { physicalRadiiAU } from '$lib/data/orbit-body-sizes';
import {
	eclipticPosition,
	eclipticToWorld,
	solarAUPerYear,
	trailPositions,
	type OrbitFrame,
	type Vec3
} from '$lib/utils/orbit-model';

export interface OrbitOptions {
	frame: OrbitFrame;
	speedFactor: number;
	yearsPerSecond: number;
	trails: boolean;
	orbits: boolean;
	labels: boolean;
	visibleTrails: string[];
	selected: string;
	trailYears: number;
	reducedMotion: boolean;
}
export interface OrbitController {
	setFramingArea: (area: FramingArea) => void;
	seek: (years: number) => void;
	view: (
		preset: CameraView,
		options?: Pick<OrbitOptions, 'frame' | 'speedFactor' | 'trailYears'>
	) => void;
	focus: (id: string) => void;
	rotate: (direction: number) => void;
	zoom: (factor: number) => void;
	dispose: () => void;
}
interface FramingArea {
	x: number;
	y: number;
	width: number;
	height: number;
}
interface Callbacks {
	getOptions: () => OrbitOptions;
	onTime: (years: number) => void;
	onInteract: () => void;
	onSelect: (id: string) => void;
	onFrame: (seconds: number) => void;
	onError: () => void;
}

/** Loaded on route mount; no reference-site renderer code is copied. */
export function createOrbitRenderer(
	host: HTMLElement,
	initialYears: number,
	callbacks: Callbacks
): OrbitController {
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: false,
		powerPreference: 'low-power'
	});
	renderer.setClearColor('#07171e');
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.autoClear = false;
	renderer.info.autoReset = false;
	const canvas = renderer.domElement;
	canvas.setAttribute(
		'aria-label',
		'태양과 여덟 행성의 3D 궤도. 드래그로 회전, 휠이나 핀치로 확대합니다.'
	);
	canvas.setAttribute('role', 'img');
	canvas.dataset.testid = 'orbit-canvas';
	host.append(canvas);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(43, 1, 0.002, 12000);
	const backgroundCamera = camera.clone();
	const sceneCamera = camera.clone();
	// OrbitControls caches its up-axis at construction. Set it once, before creating controls.
	if (host.clientWidth / host.clientHeight < 0.8) camera.up.set(0, 0, 1);
	const presetUp = camera.up.clone();
	const freeTouchRotation = window.matchMedia('(pointer: coarse)').matches;
	function makeControls() {
		// Labels share the host with the canvas. A drag starting on either must
		// belong to the same native gesture surface, including pointer capture.
		const next = freeTouchRotation
			? new TrackballControls(camera, host)
			: new OrbitControls(camera, host);
		if (next instanceof TrackballControls) {
			next.staticMoving = true;
			next.multiTouchRoll = true;
			next.keys = ['', '', ''];
		} else next.enableDamping = false;
		next.minDistance = 0.12;
		next.maxDistance = 5000;
		next.zoomSpeed = 0.65;
		next.rotateSpeed = freeTouchRotation ? 1.2 : 0.7;
		return next;
	}
	let controls = makeControls();
	scene.add(new THREE.AmbientLight('#ADC4DC', 0.65));
	const light = new THREE.PointLight('#fff5e3', 2.8, 0, 0);
	scene.add(light);
	const stars = createStarfield();
	stars.layers.set(1);
	scene.add(stars);
	const sphere = new THREE.SphereGeometry(1, 48, 32);
	const surfaces = createSurfaces(() => {
		dirty = true;
		request();
	});
	const sun = surfaces.sun(sphere);
	scene.add(sun);
	// Small local procedural texture, behind the solid solar disc, no bloom pass.
	const glowCanvas = document.createElement('canvas');
	glowCanvas.width = glowCanvas.height = 64;
	const context = glowCanvas.getContext('2d')!;
	const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
	gradient.addColorStop(0, 'rgba(243,179,86,.5)');
	gradient.addColorStop(0.22, 'rgba(243,179,86,.25)');
	gradient.addColorStop(0.6, 'rgba(243,179,86,.07)');
	gradient.addColorStop(1, 'rgba(243,179,86,0)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, 64, 64);
	const glowTexture = new THREE.CanvasTexture(glowCanvas);
	const glow = new THREE.Sprite(
		new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false })
	);
	scene.add(glow);
	const labels = document.createElement('div');
	labels.className = 'orbit-labels';
	host.append(labels);
	function label(text: string, color: string, id: string) {
		const element = document.createElement('button');
		element.type = 'button';
		element.tabIndex = -1;
		element.setAttribute('aria-label', `${text} 가까이 보기`);
		element.dataset.bodyId = id;
		// Pointer selection is shared with the canvas; preserve keyboard/AT clicks.
		element.addEventListener('click', (event) => {
			if (event.detail === 0) callbacks.onSelect(id);
		});
		element.textContent = text;
		element.style.color = color;
		labels.append(element);
		return element;
	}
	const sunLabel = label('태양', '#F2C68B', 'sun');
	const MAX_POINTS = 2049;
	function makeTrail(color: string) {
		const geometry = new LineGeometry();
		geometry.setPositions(new Float32Array(MAX_POINTS * 3));
		geometry.setColors(new Float32Array(MAX_POINTS * 3));
		const visibility = new THREE.InstancedInterleavedBuffer(
			new Float32Array((MAX_POINTS - 1) * 2).fill(1),
			2,
			1
		);
		geometry.setAttribute(
			'instanceVisibilityStart',
			new THREE.InterleavedBufferAttribute(visibility, 1, 0)
		);
		geometry.setAttribute(
			'instanceVisibilityEnd',
			new THREE.InterleavedBufferAttribute(visibility, 1, 1)
		);
		geometry.instanceCount = 0;
		const line = new Line2(
			geometry,
			new LineMaterial({
				color,
				vertexColors: true,
				transparent: true,
				opacity: 0.9,
				linewidth: 1.35,
				depthWrite: false
			})
		);
		// Keep every true segment and endpoint. Alpha reaches zero across end-on
		// intervals instead of deleting vertices and accidentally bridging the gap.
		line.material.vertexShader = line.material.vertexShader.replace(
			'void main() {',
			`attribute float instanceVisibilityStart;
				attribute float instanceVisibilityEnd;
				varying float vTrailVisibility;
				void main() {
				vTrailVisibility = position.y < 0.5 ? instanceVisibilityStart : instanceVisibilityEnd;`
		);
		line.material.fragmentShader = line.material.fragmentShader
			.replace('void main() {', 'varying float vTrailVisibility;\nvoid main() {')
			.replace(
				'vec4( diffuseColor.rgb, alpha )',
				'vec4( diffuseColor.rgb, alpha * vTrailVisibility )'
			);
		line.frustumCulled = false;
		scene.add(line);
		return line;
	}
	const sunTrail = makeTrail('#E9B570');
	const sampleSunTrail = createTrackingTrail();
	const bodies = orbitPlanets.map((planet) => {
		const mesh = surfaces.planet(planet.id, sphere);
		mesh.userData.planetId = planet.id;
		scene.add(mesh);
		// Current osculating ellipse, distinct from the past trajectory.
		const orbit = new THREE.LineLoop(
			new THREE.BufferGeometry().setFromPoints(
				Array.from(
					{ length: 256 },
					(_, n) =>
						new THREE.Vector3(
							...eclipticToWorld(eclipticPosition(planet, 0, (n / 256) * Math.PI * 2))
						)
				)
			),
			new THREE.LineBasicMaterial({ color: planet.color, transparent: true, opacity: 0.2 })
		);
		scene.add(orbit);
		return {
			planet,
			mesh,
			orbit,
			trail: makeTrail(planet.color),
			sampleTrail: createTrackingTrail(planet),
			label: label(planet.name, planet.color, planet.id)
		};
	});
	const earth = bodies.find((body) => body.planet.id === 'earth')!;
	let now = initialYears;
	let disposed = false;
	let contextLost = false;
	let inView = true;
	let raf = 0;
	let last = 0;
	let lastDraw = 0;
	let lastTrail = -Infinity;
	let trailYear = initialYears;
	let lastReport = -Infinity;
	let dirty = true;
	let firstView = true;
	let cameraRoll = 0;
	let activeView = 'trail';
	let manualCamera = false;
	let optionKey = '';
	let focusId = 'sun';
	let focusScale = 1;
	let width = 1,
		height = 1;
	let framingArea: FramingArea | undefined;
	let area: FramingArea = { x: 0, y: 0, width: 1, height: 1 };
	let tween:
		| {
				from: THREE.Vector3;
				to: THREE.Vector3;
				targetFrom: THREE.Vector3;
				targetTo: THREE.Vector3;
				rollFrom: number;
				rollTo: number;
				start: number;
				duration: number;
				closeApproach: boolean;
		  }
		| undefined;
	const point = new THREE.Vector3();
	const previousFocus = new THREE.Vector3();
	const storyFramingShift = new THREE.Vector3();
	const sizeCameraPosition = new THREE.Vector3();
	function focusPosition(id: string): THREE.Vector3 {
		const planet = orbitPlanets.find((p) => p.id === id);
		return new THREE.Vector3(
			...(planet ? eclipticToWorld(eclipticPosition(planet, now)) : ([0, 0, 0] as Vec3))
		);
	}
	function moveCamera(position: THREE.Vector3, target: THREE.Vector3, roll = 0) {
		if (firstView || callbacks.getOptions().reducedMotion) {
			camera.position.copy(position);
			controls.target.copy(target);
			cameraRoll = roll;
			tween = undefined;
		} else
			tween = {
				from: camera.position.clone(),
				to: position,
				targetFrom: controls.target.clone(),
				targetTo: target,
				rollFrom: cameraRoll,
				rollTo: cameraRoll + Math.atan2(Math.sin(roll - cameraRoll), Math.cos(roll - cameraRoll)),
				start: performance.now(),
				duration: CAMERA_TRANSITION_MS * (activeView === 'earth-journey' ? 1.5 : 1),
				closeApproach: activeView === 'earth-journey'
			};
		firstView = false;
		dirty = true;
		request();
	}
	function setActiveView(next: string) {
		if (activeView !== next) lastTrail = -Infinity;
		if (activeView === 'earth-journey' && next !== activeView) {
			// Leave room before returning to the other views' enlarged illustrative Earth.
			const earthPosition = focusPosition('earth');
			const offset = camera.position.clone().sub(earthPosition);
			if (offset.length() < displayRadii.earth * 2)
				camera.position.copy(earthPosition).add(offset.setLength(displayRadii.earth * 2));
		}
		activeView = next;
	}
	function preparePreset() {
		storyFramingShift.set(0, 0, 0);
		if (controls instanceof TrackballControls && manualCamera) {
			// Express the freely rolled camera in the preset's original up frame so
			// the next story transition can interpolate from the exact visible pose.
			const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
			const basis = new THREE.Matrix4().lookAt(camera.position, controls.target, presetUp);
			const baseRight = new THREE.Vector3().setFromMatrixColumn(basis, 0);
			const baseUp = new THREE.Vector3().setFromMatrixColumn(basis, 1);
			cameraRoll = Math.atan2(right.dot(baseUp), right.dot(baseRight));
			camera.up.copy(presetUp);
		}
		manualCamera = false;
	}
	function view(
		preset: CameraView,
		override?: Pick<OrbitOptions, 'frame' | 'speedFactor' | 'trailYears'>
	) {
		preparePreset();
		if (preset === 'earth') {
			closeup('earth', 0.68);
			return;
		}
		setActiveView(preset);
		controls.minDistance = displayRadii.sun * 1.5;
		focusId = 'sun';
		previousFocus.set(0, 0, 0);
		const options = override ?? callbacks.getOptions();
		const target = new THREE.Vector3();
		if (preset === 'earth-journey') {
			// Enlarge Earth only through camera distance; every body uses its physical AU radius.
			focusId = 'earth';
			target.copy(focusPosition(focusId));
			previousFocus.copy(target);
			controls.minDistance = physicalRadiiAU.earth * 1.25;
			const preset = earthJourneyCamera;
			const portrait = width < height;
			const direction = new THREE.Vector3(...preset.direction).normalize();
			const screenUp = new THREE.Vector3(...(portrait ? preset.portraitUp : preset.up));
			const right = new THREE.Vector3().crossVectors(screenUp, direction).normalize();
			const baseRight = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
			const baseUp = new THREE.Vector3().crossVectors(direction, baseRight).normalize();
			const roll =
				Math.atan2(right.dot(baseUp), right.dot(baseRight)) +
				(portrait ? preset.portraitRoll : preset.roll);
			const screenRadius = Math.min(
				preset.radiusCap,
				Math.min(area.width, area.height) * preset.radiusFraction
			);
			const distance =
				(physicalRadiiAU.earth * area.height) /
				(2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * screenRadius);
			moveCamera(target.clone().addScaledVector(direction, distance), target, roll);
			return;
		}
		if (
			(preset === 'trail' || preset === 'solar-front') &&
			options.frame === 'galactic' &&
			options.speedFactor === EMPHASIZED_SPEED
		) {
			// The Galactic button follows the owner's oblique, upper-left-to-lower-right reference.
			// Keep the separate legacy story preset at its accepted angle.
			const diagonal = preset === 'trail';
			target.set(-0.3, 0, 3.8);
			const offset = (
				diagonal ? new THREE.Vector3(3, 1.7, -4.6) : new THREE.Vector3(3, 1.7, -4)
			).sub(target);
			const direction = offset.clone().normalize();
			const portrait = camera.aspect < 1;
			const screenUp = new THREE.Vector3(0, portrait ? 0 : 1, portrait ? 1 : 0);
			const right = new THREE.Vector3().crossVectors(screenUp, direction).normalize();
			const baseRight = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
			const baseUp = new THREE.Vector3().crossVectors(direction, baseRight).normalize();
			const roll =
				Math.atan2(right.dot(baseUp), right.dot(baseRight)) +
				(diagonal ? (portrait ? -0.74 : 0.1) : -0.1);
			// Keep the selected perspective on resize without changing OrbitControls' up-axis.
			const fitAspect = portrait ? (diagonal ? 0.9 : 0.75) : 1.4;
			offset.multiplyScalar(Math.max(1, fitAspect / camera.aspect));
			moveCamera(target.clone().add(offset), target, roll);
			return;
		}
		if (preset === 'formation') {
			// Look almost down on the orbital plane so the planets' relative positions stay clear.
			const normal = new THREE.Vector3(...eclipticToWorld([0, 0, 1]));
			const forward = new THREE.Vector3(0, 0, -1);
			const inPlane = forward.clone().addScaledVector(normal, -forward.dot(normal)).normalize();
			const elevation = 0.97;
			const direction = normal
				.multiplyScalar(elevation)
				.addScaledVector(inPlane, Math.sqrt(1 - elevation ** 2))
				.normalize();
			if (width < 768) {
				// Turn around screen-up to reveal more travel without flattening the orbital plane.
				const travelRight = forward
					.clone()
					.addScaledVector(direction, -forward.dot(direction))
					.normalize();
				const screenUp = new THREE.Vector3().crossVectors(direction, travelRight).normalize();
				direction.applyAxisAngle(screenUp, -THREE.MathUtils.degToRad(6));
			}
			// Screen-right follows the Sun's projected Galactic motion: ahead/right, behind/left.
			const right = forward.clone().addScaledVector(direction, -forward.dot(direction)).normalize();
			const baseRight = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
			const baseUp = new THREE.Vector3().crossVectors(direction, baseRight).normalize();
			const roll = Math.atan2(right.dot(baseUp), right.dot(baseRight));
			const distance = Math.max(
				5.2,
				1.9 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
			);
			const position = direction.clone().multiplyScalar(distance * 1.04);
			if (width < 768) {
				// Leave more room for the history on the left while keeping the Sun's height and size.
				const horizontalShift = 0.12 * area.width + 10;
				const shift = right
					.clone()
					.multiplyScalar(
						(-horizontalShift *
							2 *
							Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
							distance *
							1.04) /
							area.height
					);
				position.add(shift);
				target.add(shift);
				storyFramingShift.copy(shift);
			}
			moveCamera(position, target, roll);
			return;
		}
		let position: Vec3;
		if (preset === 'overview') position = [50, 39, 54];
		else if (preset === 'top') position = eclipticToWorld([0, 0, 5.5]);
		else if ((preset === 'trail' || preset === 'journey') && options.frame === 'galactic') {
			const length = solarAUPerYear(options.speedFactor) * Math.min(now, options.trailYears);
			const journey = preset === 'journey';
			target.z = length * (journey ? 0.42 : 0.5);
			// Look across the trajectory instead of straight down its axis.
			// Story chapter 3 keeps the same viewing angle on desktop and mobile.
			const direction = journey
				? new THREE.Vector3(1, 0.275, -0.2625).normalize()
				: new THREE.Vector3(1, 0.52, 0.18).normalize();
			// Fit the available width through distance, keeping the desktop screen-up.
			const screenUp = journey ? new THREE.Vector3(0, 1, 0) : camera.up;
			const right = new THREE.Vector3().crossVectors(screenUp, direction).normalize();
			const up = new THREE.Vector3().crossVectors(direction, right).normalize();
			const baseRight = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
			const baseUp = new THREE.Vector3().crossVectors(direction, baseRight).normalize();
			const diagonalTrail = !journey && options.speedFactor === 1 && width < 768;
			const rollRight = diagonalTrail
				? new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize()
				: right;
			const roll =
				Math.atan2(rollRight.dot(baseUp), rollRight.dot(baseRight)) +
				(journey ? -0.12 : diagonalTrail ? 0.85 : 0);
			const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
			const bounds: THREE.Vector3[] = [];
			if (journey) {
				// Frame the current inner orbits and the far end of the path, rather than its axis.
				for (let i = 0; i < 16; i++) {
					const angle = (i / 16) * Math.PI * 2;
					bounds.push(
						new THREE.Vector3(...eclipticToWorld([1.8 * Math.cos(angle), 1.8 * Math.sin(angle), 0]))
					);
				}
				bounds.push(new THREE.Vector3(0, 0, length));
			} else {
				for (const x of [-2.2, 2.2])
					for (const y of [-2.2, 2.2])
						for (const z of [-2, length + 2]) bounds.push(new THREE.Vector3(x, y, z));
			}
			let distance = journey ? 8.6 : 0;
			for (const bound of bounds) {
				const corner = bound.sub(target);
				distance = Math.max(
					distance,
					Math.abs(corner.dot(right)) / (tanV * camera.aspect) + corner.dot(direction),
					Math.abs(corner.dot(up)) / tanV + corner.dot(direction)
				);
			}
			// Bring the actual-speed journey closer while retaining its full path and angle.
			const framingMargin = journey ? 1.08 : options.speedFactor === 1 ? 1.05 : 1.25;
			const position = target.clone().addScaledVector(direction, distance * framingMargin);
			if (width < 768 && (journey || diagonalTrail)) {
				// Crop the distant path to favor the Sun and nearby planets on small screens.
				// Move eye and target together; retain the viewing direction and body proportions.
				const scale = journey ? 1.1 : 1.3 * 1.15;
				const screenRight = baseRight.clone().applyAxisAngle(direction, roll);
				const screenUp = new THREE.Vector3().crossVectors(direction, screenRight);
				const depth = position.dot(direction);
				const pixelScale = (2 * tanV) / area.height;
				const sunX = -position.dot(screenRight) / (depth * pixelScale);
				const sunY = position.dot(screenUp) / (depth * pixelScale);
				const desiredX = journey ? sunX - 0.2 * width : (0.77 - 0.5) * area.width;
				const desiredY = journey ? sunY : (0.8 - 0.5) * area.height;
				const shift = position
					.clone()
					.multiplyScalar(1 / scale - 1)
					.addScaledVector(screenRight, ((sunX - desiredX) * depth * pixelScale) / scale)
					.addScaledVector(screenUp, ((desiredY - sunY) * depth * pixelScale) / scale);
				position.add(shift);
				target.add(shift);
				storyFramingShift.copy(shift);
			}
			moveCamera(position, target, roll);
			return;
		} else {
			const companions = preset === 'companions';
			const normal = new THREE.Vector3(...eclipticToWorld([0, 0, 1]));
			const inPlane = camera.up.clone().addScaledVector(normal, -camera.up.dot(normal)).normalize();
			if (companions) inPlane.applyAxisAngle(normal, 0.35);
			const elevation = companions ? 0.4 : 0.5;
			const direction = normal
				.multiplyScalar(elevation)
				.addScaledVector(inPlane, -Math.sqrt(1 - elevation ** 2))
				.normalize();
			const distance = Math.max(
				companions ? 5.5 : 4.9,
				(companions ? 2.1 : 2) /
					(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
			);
			moveCamera(direction.multiplyScalar(distance), target);
			return;
		}
		// Preserve horizontal field of view on portrait screens.
		const offset = new THREE.Vector3(...position)
			.sub(target)
			.multiplyScalar(Math.max(1, 0.95 / camera.aspect));
		moveCamera(target.clone().add(offset), target);
	}
	function closeup(id: string, scale = 1) {
		preparePreset();
		controls.minDistance = (displayRadii[id] ?? 0.1) * 1.5;
		setActiveView(`focus-${id}`);
		focusId = id;
		focusScale = scale;
		const target = focusPosition(id);
		previousFocus.copy(target);
		const distance = (displayRadii[id] ?? 0.1) * (id === 'saturn' ? 8 : 5.5) * scale;
		const offset = new THREE.Vector3(0.9, 0.55, 1)
			.normalize()
			.multiplyScalar(distance * Math.max(1, 0.95 / camera.aspect));
		moveCamera(target.clone().add(offset), target);
	}
	function focus(id: string, preserveDirection = false) {
		preparePreset();
		const target = focusPosition(id);
		const direction = camera.position.clone().sub(controls.target).normalize();
		if (id !== 'sun' && !preserveDirection) {
			// Start outside the selected orbit, with the Sun and inner system behind it.
			const normal = new THREE.Vector3(...eclipticToWorld([0, 0, 1]));
			direction
				.copy(target)
				.normalize()
				.multiplyScalar(0.92)
				.addScaledVector(normal, 0.4)
				.normalize();
		}
		setActiveView(`track-${id}`);
		focusId = id;
		previousFocus.copy(target);
		controls.minDistance = (displayRadii[id] ?? 0.1) * 1.5;
		const distance = (displayRadii[id] ?? 0.1) * (id === 'saturn' ? 8 : 5.5);
		direction.multiplyScalar(distance * Math.max(1, 0.95 / camera.aspect));
		moveCamera(target.clone().add(direction), target, cameraRoll);
	}
	const trailWeights = new Float32Array(MAX_POINTS);
	const trailEye: Vec3 = [0, 0, 0];
	function updateTrail(
		line: Line2,
		positions: Vec3[],
		origin?: THREE.Vector3,
		fractions?: number[],
		fadeEndOn = false
	) {
		// Subtract in double precision before uploading Float32 vertices near the physical Earth.
		// The model-view translation then stays local instead of cancelling AU-sized GPU values.
		if (origin) line.position.copy(origin);
		else line.position.set(0, 0, 0);
		const starts = line.geometry.getAttribute('instanceStart') as THREE.InterleavedBufferAttribute;
		const ends = line.geometry.getAttribute('instanceEnd') as THREE.InterleavedBufferAttribute;
		const colorStart = line.geometry.getAttribute(
			'instanceColorStart'
		) as THREE.InterleavedBufferAttribute;
		const colorEnd = line.geometry.getAttribute(
			'instanceColorEnd'
		) as THREE.InterleavedBufferAttribute;
		const visibilityStart = line.geometry.getAttribute(
			'instanceVisibilityStart'
		) as THREE.InterleavedBufferAttribute;
		const visibilityEnd = line.geometry.getAttribute(
			'instanceVisibilityEnd'
		) as THREE.InterleavedBufferAttribute;
		trailEye[0] = camera.position.x;
		trailEye[1] = camera.position.y;
		trailEye[2] = camera.position.z;
		let suppressed = 0;
		for (let i = 0; i < positions.length; i++) {
			trailWeights[i] = fadeEndOn ? trailVisibility(positions, i, fractions, trailEye) : 1;
			if (trailWeights[i] === 0) suppressed++;
		}
		let segments = 0;
		for (let i = 0; i < positions.length - 1; i++) {
			if (positions[i].every((v, axis) => Math.abs(v - positions[i + 1][axis]) < 1e-12)) continue;
			starts.setXYZ(
				segments,
				positions[i][0] - line.position.x,
				positions[i][1] - line.position.y,
				positions[i][2] - line.position.z
			);
			ends.setXYZ(
				segments,
				positions[i + 1][0] - line.position.x,
				positions[i + 1][1] - line.position.y,
				positions[i + 1][2] - line.position.z
			);
			const a = 0.04 + 0.96 * Math.pow(fractions?.[i] ?? i / (positions.length - 1), 0.8);
			const b = 0.04 + 0.96 * Math.pow(fractions?.[i + 1] ?? (i + 1) / (positions.length - 1), 0.8);
			colorStart.setXYZ(segments, a, a, a);
			colorEnd.setXYZ(segments, b, b, b);
			visibilityStart.setX(segments, trailWeights[i]);
			visibilityEnd.setX(segments, trailWeights[i + 1]);
			segments++;
		}
		starts.data.needsUpdate = true;
		colorStart.data.needsUpdate = true;
		visibilityStart.data.needsUpdate = true;
		line.geometry.instanceCount = segments;
		if (line === earth.trail) canvas.dataset.traceSuppressedPoints = String(suppressed);
	}
	function placeLabel(
		element: HTMLElement,
		position: THREE.Vector3,
		visible: boolean,
		offsetX = 12
	) {
		point.copy(position).project(camera);
		const x = area.x + ((point.x + 1) / 2) * area.width;
		const y = area.y + ((1 - point.y) / 2) * area.height;
		const show =
			visible && point.z > -1 && point.z < 1 && x >= 0 && x <= width && y >= 0 && y <= height;
		element.hidden = !show;
		if (show) {
			element.style.transform = `translate(${x + offsetX}px,${y - 20}px)`;
		}
	}
	function draw(stamp: number) {
		raf = 0;
		if (disposed || contextLost || !inView || document.hidden) {
			last = 0;
			return;
		}
		request();
		if (stamp - lastDraw < 1000 / 30) return;
		const delta = last ? Math.min((stamp - last) / 1000, 0.1) : 0;
		last = stamp;
		lastDraw = stamp;
		const options = callbacks.getOptions();
		const key = [
			options.frame,
			options.speedFactor,
			options.trails,
			options.orbits,
			options.labels,
			options.visibleTrails.join(),
			options.selected,
			options.trailYears
		].join('|');
		if (key !== optionKey) {
			optionKey = key;
			dirty = true;
			lastTrail = -Infinity;
		}
		// Repeat the documented model range rather than stopping the requested continuous motion.
		now = (now + delta * options.yearsPerSecond) % MAX_ORBIT_YEARS;
		dirty = true;
		if (focusId !== 'sun') {
			const target = focusPosition(focusId);
			const change = target.clone().sub(previousFocus);
			if (tween) {
				if (tween.closeApproach || activeView.startsWith('track-')) {
					tween.from.add(change);
					tween.targetFrom.add(change);
				}
				tween.to.add(change);
				tween.targetTo.add(change);
			} else {
				camera.position.add(change);
				controls.target.add(change);
			}
			previousFocus.copy(target);
		}
		if (tween) {
			const t = Math.min(1, (stamp - tween.start) / tween.duration);
			const eased = t * t * (3 - 2 * t);
			const pan = tween.closeApproach ? Math.min(1, t / 0.4) : t;
			controls.target.lerpVectors(tween.targetFrom, tween.targetTo, pan * pan * (3 - 2 * pan));
			if (tween.closeApproach) {
				// Settle the look target while still wide, then approach across the AU-to-body scale gap.
				const zoom = Math.max(0, Math.min(1, (t - 0.3) / 0.7));
				const approach = zoom * zoom * (3 - 2 * zoom);
				const from = tween.from.clone().sub(tween.targetFrom);
				const to = tween.to.clone().sub(tween.targetTo);
				const distance = Math.exp(
					THREE.MathUtils.lerp(Math.log(from.length()), Math.log(to.length()), approach)
				);
				point.lerpVectors(from.normalize(), to.normalize(), approach).normalize();
				camera.position.copy(controls.target).addScaledVector(point, distance);
			} else camera.position.lerpVectors(tween.from, tween.to, eased);
			cameraRoll = THREE.MathUtils.lerp(tween.rollFrom, tween.rollTo, eased);
			if (t === 1) tween = undefined;
			dirty = true;
		}
		if (!dirty) return;
		controls.update();
		const earthJourney = activeView === 'earth-journey';
		const near = earthJourney
			? Math.max(
					physicalRadiiAU.earth * 0.02,
					(camera.position.distanceTo(previousFocus) - physicalRadiiAU.earth) * 0.25
				)
			: 0.002;
		if (camera.near !== near) {
			camera.near = near;
			camera.updateProjectionMatrix();
		}
		// Both controls lookAt each update; manual trackball rotation has already consumed the roll.
		camera.rotateZ(cameraRoll);
		camera.updateMatrixWorld();
		const closeView = activeView.startsWith('focus-');
		const trackingView = activeView.startsWith('track-');
		labels.hidden = !options.labels;
		const pixelScale = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / area.height;
		const largeBodies =
			activeView === 'companions' ||
			activeView === 'solar-front' ||
			activeView === 'journey' ||
			activeView === 'formation';
		// Keep the pre-crop readability sizes so the mobile camera enlargement is not canceled.
		sizeCameraPosition.copy(camera.position).sub(storyFramingShift);
		stars.position.copy(camera.position);
		sun.rotation.y = now;
		sun.scale.setScalar(
			earthJourney
				? physicalRadiiAU.sun
				: Math.max(
						displayRadii.sun,
						sizeCameraPosition.length() * pixelScale * (largeBodies ? 18 : 9)
					)
		);
		glow.scale.setScalar(sun.scale.x * 8);
		glow.position
			.copy(camera.position)
			.normalize()
			.multiplyScalar(-sun.scale.x * 0.1);
		sun.visible = !closeView || focusId === 'sun';
		placeLabel(
			sunLabel,
			sun.position,
			sun.visible,
			trackingView && focusId === 'sun'
				? sun.scale.x / (camera.position.length() * pixelScale) + 10
				: 12
		);
		glow.visible = sun.visible;
		for (const body of bodies) {
			body.mesh.visible = !closeView || focusId === body.planet.id;
			body.mesh.position.set(...eclipticToWorld(eclipticPosition(body.planet, now)));
			body.mesh.scale.setScalar(
				earthJourney
					? physicalRadiiAU[body.planet.id]
					: Math.max(
							displayRadii[body.planet.id],
							sizeCameraPosition.distanceTo(body.mesh.position) *
								pixelScale *
								(largeBodies ? 7 : options.selected === body.planet.id ? 4.5 : 3.5)
						)
			);
			body.mesh.rotation.y = now * 2;
			body.orbit.visible = options.orbits && !closeView;
			body.trail.visible =
				options.trails && !closeView && options.visibleTrails.includes(body.planet.id);
			body.orbit.material.opacity = earthJourney ? 0.1 : 0.2;
			body.trail.material.opacity = earthJourney
				? body === earth
					? 0.7
					: 0.28
				: options.selected === body.planet.id
					? 1
					: 0.9;
			placeLabel(
				body.label,
				body.mesh.position,
				body.mesh.visible,
				(earthJourney && body === earth) || (trackingView && focusId === body.planet.id)
					? body.mesh.scale.x / (camera.position.distanceTo(body.mesh.position) * pixelScale) + 10
					: 12
			);
		}
		sunTrail.visible = options.trails && options.frame === 'galactic' && !closeView;
		sunTrail.material.opacity = earthJourney ? 0.35 : 0.9;
		const liveTrails = trackingView || earthJourney;
		if (liveTrails || stamp - lastTrail > 1000 / 12) {
			const maxPoints = window.innerWidth < 768 ? 1024 : 2048;
			const origin = earthJourney ? earth.mesh.position : undefined;
			const projection: TrailProjection | undefined = earthJourney
				? {
						project(position) {
							point.set(...position).applyMatrix4(camera.matrixWorldInverse);
							const depth = -point.z;
							const scale = 1 / (pixelScale * Math.max(camera.near, depth));
							return [
								area.x + area.width / 2 + point.x * scale,
								area.y + area.height / 2 - point.y * scale,
								depth
							];
						},
						near: camera.near,
						left: 0,
						top: 0,
						width,
						height
					}
				: undefined;
			for (const body of bodies) {
				if (!body.trail.visible) continue;
				const positions = liveTrails
					? body.sampleTrail(
							now,
							options.trailYears,
							options.frame,
							options.speedFactor,
							maxPoints,
							projection
						)
					: trailPositions(
							body.planet,
							now,
							options.trailYears,
							options.frame,
							options.speedFactor,
							maxPoints
						);
				updateTrail(
					body.trail,
					positions,
					origin,
					earthJourney ? body.sampleTrail.fractions : undefined,
					earthJourney
				);
			}
			updateTrail(
				sunTrail,
				liveTrails
					? sampleSunTrail(now, options.trailYears, options.frame, options.speedFactor, maxPoints)
					: trailPositions(undefined, now, options.trailYears, options.frame, options.speedFactor),
				origin,
				undefined,
				earthJourney
			);
			lastTrail = stamp;
			trailYear = now;
		}
		// Fit the main subject in the safe area, then extend the same perspective to
		// the full canvas so paths continue naturally behind translucent captions.
		renderer.info.reset();
		renderer.setViewport(0, 0, width, height);
		renderer.setScissorTest(false);
		renderer.clear();
		backgroundCamera.copy(camera);
		backgroundCamera.aspect = width / height;
		backgroundCamera.updateProjectionMatrix();
		backgroundCamera.layers.set(1);
		renderer.render(scene, backgroundCamera);
		sceneCamera.copy(camera);
		sceneCamera.setViewOffset(area.width, area.height, -area.x, -area.y, width, height);
		renderer.clearDepth();
		renderer.render(scene, sceneCamera);
		point.copy(sun.position).project(camera);
		canvas.dataset.sunScreen = [
			area.x + ((point.x + 1) / 2) * area.width,
			area.y + ((1 - point.y) / 2) * area.height,
			sun.scale.x / (-sun.position.clone().applyMatrix4(camera.matrixWorldInverse).z * pixelScale)
		]
			.map((v) => v.toFixed(2))
			.join(',');
		point
			.set(0, 0, solarAUPerYear(options.speedFactor) * Math.min(now, options.trailYears))
			.project(camera);
		canvas.dataset.trailStartScreen = [
			area.x + ((point.x + 1) / 2) * area.width,
			area.y + ((1 - point.y) / 2) * area.height
		]
			.map((v) => v.toFixed(2))
			.join(',');
		canvas.dataset.year = now.toFixed(6);
		canvas.dataset.yearsPerSecond = String(options.yearsPerSecond);
		canvas.dataset.sizeMode = earthJourney ? 'physical' : 'illustrative';
		canvas.dataset.earthCamera = earthJourney ? activeEarthJourneyCamera : '';
		canvas.dataset.cameraControls = freeTouchRotation ? 'trackball' : 'orbit';
		canvas.dataset.cameraUp = camera.up
			.toArray()
			.map((v) => v.toFixed(9))
			.join(',');
		canvas.dataset.traceEndOnFade = String(earthJourney);
		canvas.dataset.bodyRadiiAu = JSON.stringify(
			Object.fromEntries([
				['sun', sun.scale.x],
				...bodies.map((body) => [body.planet.id, body.mesh.scale.x])
			])
		);
		canvas.dataset.sunRotation = sun.rotation.y.toFixed(6);
		canvas.dataset.earthPosition = earth.mesh.position
			.toArray()
			.map((v) => v.toFixed(9))
			.join(',');
		point.copy(earth.mesh.position).project(camera);
		canvas.dataset.earthScreen = [
			area.x + ((point.x + 1) / 2) * area.width,
			area.y + ((1 - point.y) / 2) * area.height,
			earth.mesh.scale.x /
				(-earth.mesh.position.clone().applyMatrix4(camera.matrixWorldInverse).z * pixelScale)
		]
			.map((v) => v.toFixed(2))
			.join(',');
		canvas.dataset.frame = options.frame;
		canvas.dataset.speedFactor = String(options.speedFactor);
		canvas.dataset.trails = String(bodies.filter((b) => b.trail.visible).length);
		canvas.dataset.camera = camera.position
			.toArray()
			.map((v) => v.toFixed(9))
			.join(',');
		canvas.dataset.preset = activeView;
		canvas.dataset.transitioning = String(Boolean(tween));
		canvas.dataset.focus = closeView || earthJourney || trackingView ? focusId : '';
		const focusedMesh =
			focusId === 'sun' ? sun : bodies.find((body) => body.planet.id === focusId)!.mesh;
		point.copy(focusedMesh.position).project(camera);
		canvas.dataset.focusScreen = [
			area.x + ((point.x + 1) / 2) * area.width,
			area.y + ((1 - point.y) / 2) * area.height,
			focusedMesh.scale.x /
				(-focusedMesh.position.clone().applyMatrix4(camera.matrixWorldInverse).z * pixelScale)
		]
			.map((v) => v.toFixed(2))
			.join(',');
		canvas.dataset.focusPosition = focusedMesh.position
			.toArray()
			.map((v) => v.toFixed(9))
			.join(',');
		canvas.dataset.focusRotation = focusedMesh.rotation.y.toFixed(6);
		const focusedTrail =
			focusId === 'sun' ? sunTrail : bodies.find((body) => body.planet.id === focusId)!.trail;
		const trailEnd = focusedTrail.geometry.getAttribute('instanceEnd');
		const segment = Math.max(0, focusedTrail.geometry.instanceCount - 1);
		point
			.set(trailEnd.getX(segment), trailEnd.getY(segment), trailEnd.getZ(segment))
			.applyMatrix4(focusedTrail.matrixWorld);
		const traceGap = point.distanceTo(focusedMesh.position);
		point.project(camera);
		canvas.dataset.traceHeadScreen = [
			area.x + ((point.x + 1) / 2) * area.width,
			area.y + ((1 - point.y) / 2) * area.height
		]
			.map((v) => v.toFixed(4))
			.join(',');
		canvas.dataset.traceHeadGapAu = String(traceGap);
		canvas.dataset.traceYear = trailYear.toFixed(6);
		canvas.dataset.traceSamplingPoints = String(earth.trail.geometry.instanceCount + 1);
		canvas.dataset.traceRefinedPoints = String(earthJourney ? earth.sampleTrail.quality.added : 0);
		canvas.dataset.traceProjectionError = String(
			earthJourney ? earth.sampleTrail.quality.maxError : 0
		);
		canvas.dataset.traceBudgetLimited = String(
			earthJourney && earth.sampleTrail.quality.budgetLimited
		);
		canvas.dataset.orbits = String(bodies.filter((body) => body.orbit.visible).length);
		canvas.dataset.sunVisible = String(sun.visible);
		canvas.dataset.sunTrail = String(sunTrail.visible);
		canvas.dataset.bodies = bodies
			.filter((b) => b.mesh.visible)
			.map((b) => b.planet.id)
			.join(',');
		canvas.dataset.target = controls.target
			.toArray()
			.map((v) => v.toFixed(9))
			.join(',');
		canvas.dataset.cameraNear = String(camera.near);
		canvas.dataset.drawCalls = String(renderer.info.render.calls);
		canvas.dataset.triangles = String(renderer.info.render.triangles);
		if (stamp - lastReport > 200) {
			callbacks.onTime(now);
			lastReport = stamp;
		}
		dirty = false;
		callbacks.onFrame(delta);
	}
	function request() {
		if (!raf && !disposed && !contextLost && inView && !document.hidden)
			raf = requestAnimationFrame(draw);
	}
	function fitArea() {
		const requested = framingArea ?? { x: 0, y: 0, width, height };
		const next = {
			x: Math.round(THREE.MathUtils.clamp(requested.x, 0, width - 1)),
			y: Math.round(THREE.MathUtils.clamp(requested.y, 0, height - 1)),
			width: Math.round(Math.max(1, Math.min(requested.width, width - requested.x))),
			height: Math.round(Math.max(1, Math.min(requested.height, height - requested.y)))
		};
		if (
			Object.keys(next).every(
				(key) => next[key as keyof FramingArea] === area[key as keyof FramingArea]
			)
		)
			return;
		area = next;
		for (const trail of [sunTrail, ...bodies.map((b) => b.trail)])
			trail.material.resolution.set(width, height);
		camera.aspect = area.width / area.height;
		camera.updateProjectionMatrix();
		canvas.dataset.framingArea = [area.x, area.y, area.width, area.height].join(',');
		// Resize the preset, but never reset a visitor's freely rotated or zoomed camera.
		if (!firstView && !manualCamera) {
			if (activeView.startsWith('focus-')) closeup(focusId, focusScale);
			else if (activeView.startsWith('track-')) focus(focusId, true);
			else view(activeView as CameraView);
		}
		dirty = true;
		request();
	}
	function resize() {
		width = Math.max(1, host.clientWidth);
		height = Math.max(1, host.clientHeight);
		renderer.setSize(width, height, false);
		if (controls instanceof TrackballControls) controls.handleResize();
		fitArea();
		dirty = true;
		request();
	}
	function interact() {
		if (controls instanceof TrackballControls && !manualCamera) {
			// Hand the visible screen-up to the trackball once. Reapplying the
			// preset roll every frame would counteract the user's free rotation.
			camera.up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
			cameraRoll = 0;
		}
		manualCamera = true;
		tween = undefined;
		callbacks.onInteract();
		dirty = true;
	}
	function change() {
		dirty = true;
		request();
	}
	function visibility() {
		last = 0;
		dirty = true;
		request();
	}
	function lost(event: Event) {
		event.preventDefault();
		if (disposed) return;
		contextLost = true;
		cancelAnimationFrame(raf);
		callbacks.onError();
	}
	const pointerStart = new THREE.Vector2();
	const raycaster = new THREE.Raycaster();
	let pointerHit: THREE.Object3D | undefined;
	let pickingPointer: number | undefined;
	function pointerDown(event: PointerEvent) {
		if (!event.isPrimary) {
			pointerHit = undefined;
			pickingPointer = undefined;
			return;
		}
		pickingPointer = event.pointerId;
		pointerStart.set(event.clientX, event.clientY);
		// Pick before a moving body or camera gesture can change the intended target
		// between pointerdown and pointerup.
		const tag =
			event.target instanceof Element
				? event.target.closest<HTMLButtonElement>('button[data-body-id]')
				: null;
		const taggedBody =
			tag?.dataset.bodyId === 'sun'
				? sun
				: bodies.find((body) => body.planet.id === tag?.dataset.bodyId)?.mesh;
		const rect = tag?.getBoundingClientRect();
		const insideTag =
			rect &&
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;
		// Mobile browsers can redirect a tap to a nearby moving name tag. When
		// the finger is outside that tag, give the actual sphere at the point priority.
		pointerHit = insideTag ? taggedBody : (pick(event) ?? taggedBody);
	}
	function pick(event: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left - area.x;
		const y = event.clientY - rect.top - area.y;
		if (x + area.x < 0 || x + area.x > width || y + area.y < 0 || y + area.y > height) return;
		raycaster.setFromCamera(
			new THREE.Vector2((x / area.width) * 2 - 1, -(y / area.height) * 2 + 1),
			camera
		);
		return raycaster.intersectObjects(
			[sun, ...bodies.map((b) => b.mesh)].filter((mesh) => mesh.visible),
			false
		)[0]?.object;
	}
	function pointerUp(event: PointerEvent) {
		// Trackball collects movement until update(); consume the last delta before
		// its native touch-end handler resets it, even between capped render frames.
		if (controls instanceof TrackballControls && manualCamera) controls.update();
		if (event.pointerId !== pickingPointer) return;
		const hit = pointerHit;
		pointerHit = undefined;
		pickingPointer = undefined;
		if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
		if (hit) callbacks.onSelect(hit.userData.planetId ?? 'sun');
	}
	function cancelPick(event: PointerEvent) {
		if (event.pointerId !== pickingPointer) return;
		pointerHit = undefined;
		pickingPointer = undefined;
	}
	controls.addEventListener('start', interact);
	controls.addEventListener('change', change);
	const releaseGestureGuard = guardOrbitGestures(host, () => {
		pointerHit = undefined;
		pickingPointer = undefined;
		const target = controls.target.clone();
		const minimum = controls.minDistance;
		const maximum = controls.maxDistance;
		controls.dispose();
		controls = makeControls();
		controls.target.copy(target);
		controls.minDistance = minimum;
		controls.maxDistance = maximum;
		controls.addEventListener('start', interact);
		controls.addEventListener('change', change);
		controls.update();
		dirty = true;
		request();
	});
	canvas.addEventListener('webglcontextlost', lost);
	host.addEventListener('pointerdown', pointerDown, true);
	host.addEventListener('pointerup', pointerUp, true);
	host.addEventListener('pointercancel', cancelPick, true);
	host.addEventListener('lostpointercapture', cancelPick, true);
	document.addEventListener('visibilitychange', visibility);
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(host);
	const intersection = new IntersectionObserver((entries) => {
		inView = entries[0].isIntersecting;
		last = 0;
		dirty = true;
		request();
	});
	intersection.observe(host);
	resize();
	// First scene is complete immediately; later preset changes may interpolate.
	camera.position.set(4, 3.2, 5.2).multiplyScalar(Math.max(1, 0.95 / camera.aspect));
	controls.update();
	request();
	return {
		setFramingArea(value) {
			framingArea = value;
			fitArea();
		},
		seek(years) {
			now = THREE.MathUtils.clamp(years, 0, MAX_ORBIT_YEARS);
			lastTrail = -Infinity;
			dirty = true;
			callbacks.onTime(now);
			request();
		},
		view,
		focus,
		rotate(direction) {
			interact();
			const offset = camera.position
				.clone()
				.sub(controls.target)
				.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * 0.25);
			camera.position.copy(controls.target).add(offset);
			change();
		},
		zoom(factor) {
			interact();
			const offset = camera.position.clone().sub(controls.target);
			offset.multiplyScalar(
				THREE.MathUtils.clamp(
					offset.length() * factor,
					controls.minDistance,
					controls.maxDistance
				) / offset.length()
			);
			camera.position.copy(controls.target).add(offset);
			change();
		},
		dispose() {
			disposed = true;
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			intersection.disconnect();
			document.removeEventListener('visibilitychange', visibility);
			canvas.removeEventListener('webglcontextlost', lost);
			host.removeEventListener('pointerdown', pointerDown, true);
			host.removeEventListener('pointerup', pointerUp, true);
			host.removeEventListener('pointercancel', cancelPick, true);
			host.removeEventListener('lostpointercapture', cancelPick, true);
			releaseGestureGuard();
			controls.dispose();
			const geometries = new Set<THREE.BufferGeometry>();
			const materials = new Set<THREE.Material>();
			scene.traverse((object) => {
				if (
					object instanceof THREE.Mesh ||
					object instanceof THREE.Line ||
					object instanceof THREE.Sprite ||
					object instanceof THREE.Points
				) {
					if ('geometry' in object) geometries.add(object.geometry);
					for (const material of Array.isArray(object.material)
						? object.material
						: [object.material])
						materials.add(material);
				}
			});
			geometries.forEach((g) => g.dispose());
			materials.forEach((m) => m.dispose());
			glowTexture.dispose();
			surfaces.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			canvas.remove();
			labels.remove();
		}
	};
}
