import * as THREE from 'three';

// Artistic display radii in AU, deliberately enlarged. Never used by orbital calculations.
export const displayRadii: Record<string, number> = {
	sun: 0.17,
	mercury: 0.04,
	venus: 0.075,
	earth: 0.08,
	mars: 0.055,
	jupiter: 0.32,
	saturn: 0.27,
	uranus: 0.17,
	neptune: 0.17
};
export function createSurfaces(invalidate: () => void) {
	const loader = new THREE.TextureLoader();
	const textures: THREE.Texture[] = [];
	function texture(id: string, color = true) {
		const map = loader.load(`/orbit/textures/${id}.webp`, invalidate, undefined, invalidate);
		if (color) map.colorSpace = THREE.SRGBColorSpace;
		map.anisotropy = 4;
		textures.push(map);
		return map;
	}
	function planet(id: string, geometry: THREE.SphereGeometry) {
		const material = new THREE.MeshStandardMaterial({ map: texture(id), roughness: 0.94 });
		const mesh = new THREE.Mesh(geometry, material);
		// Surface rotation is illustrative, not an IAU body-orientation ephemeris.
		mesh.rotation.z = id === 'saturn' ? 0.47 : id === 'uranus' ? 1.7 : 0.1;
		if (id === 'earth') {
			const clouds = new THREE.Mesh(
				geometry,
				new THREE.MeshStandardMaterial({
					color: '#ffffff',
					alphaMap: texture('earth-clouds', false),
					transparent: true,
					opacity: 0.5,
					depthWrite: false,
					roughness: 1
				})
			);
			clouds.scale.setScalar(1.012);
			mesh.add(clouds);
			const atmosphere = new THREE.Mesh(
				geometry,
				new THREE.ShaderMaterial({
					vertexShader:
						'varying vec3 n; varying vec3 v; void main(){ vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
					fragmentShader:
						'varying vec3 n; varying vec3 v; void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(v))),4.); gl_FragColor=vec4(.22,.58,.82,edge*.45);}',
					transparent: true,
					depthWrite: false
				})
			);
			atmosphere.scale.setScalar(1.035);
			mesh.add(atmosphere);
		}
		if (id === 'saturn') {
			// Independent radial ring material: illustrative bands and Cassini-like gap.
			const rings = new THREE.Mesh(
				new THREE.RingGeometry(1.23, 2.25, 128),
				new THREE.ShaderMaterial({
					vertexShader:
						'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
					fragmentShader:
						`varying vec3 p; void main(){float r=length(p.xy); float gap=smoothstep(1.89,1.91,r)*(1.-smoothstep(1.97,1.99,r)); float bands=.6+.12*sin(r*180.)+.08*sin(r*63.); gl_FragColor=vec4(vec3(.67,.59,.43)*bands,(1.-gap)*.8); #include <colorspace_fragment> }`.replace(
							'#include <colorspace_fragment>',
							'\n#include <colorspace_fragment>\n'
						),
					side: THREE.DoubleSide,
					transparent: true,
					depthWrite: false
				})
			);
			rings.rotation.x = Math.PI / 2;
			mesh.add(rings);
		}
		return mesh;
	}
	function sun(geometry: THREE.SphereGeometry) {
		return new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({ map: texture('sun'), color: '#ffd693' })
		);
	}
	return { planet, sun, dispose: () => textures.forEach((map) => map.dispose()) };
}

/** A decorative, deterministic star field, not an astrometric catalogue. */
export function createStarfield() {
	let seed = 47291;
	const random = () => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	const positions: number[] = [],
		colors: number[] = [],
		sizes: number[] = [];
	for (let i = 0; i < 5000; i++) {
		const y = random() * 2 - 1,
			phi = random() * Math.PI * 2;
		const radius = Math.sqrt(1 - y * y);
		positions.push(Math.cos(phi) * radius * 2000, y * 2000, Math.sin(phi) * radius * 2000);
		const b = 0.28 + Math.pow(random(), 4) * 0.55;
		colors.push(b * 0.82, b * 0.91, b);
		sizes.push(random() < 0.04 ? 2 : 0.8 + random() * 0.6);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
	return new THREE.Points(
		geometry,
		new THREE.ShaderMaterial({
			vertexShader:
				'attribute float size; varying vec3 c; void main(){c=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=size*1.8;}',
			fragmentShader:
				'varying vec3 c; void main(){float a=1.-smoothstep(.1,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(c,a);\n#include <colorspace_fragment>\n}',
			vertexColors: true,
			transparent: true,
			depthWrite: false
		})
	);
}
