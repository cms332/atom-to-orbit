import type { ScienceSource } from './science';

interface AtomicLengthMeasurement {
	meters: number;
	definition: string;
	sourceId: string;
}

/** SI metres, NIST 2022 CODATA. Neither length defines a hard surface. */
export const atomicLengths = {
	bohrRadius: {
		meters: 5.29177210544e-11,
		definition: 'Bohr radius a0; fixed-nucleus hydrogen length scale',
		sourceId: 'atom-space-constants'
	},
	protonChargeRadius: {
		meters: 8.4075e-16,
		definition: 'Proton RMS charge radius; not a hard-sphere surface radius',
		sourceId: 'atom-space-constants'
	}
} as const satisfies Record<string, AtomicLengthMeasurement>;
export const BOHR_RADIUS = atomicLengths.bohrRadius.meters;
export const PROTON_CHARGE_RMS_RADIUS = atomicLengths.protonChargeRadius.meters;
export const MODEL_NUCLEUS_DIAMETER = 0.01;
export const ATOMIC_LENGTH_RATIO = BOHR_RADIUS / PROTON_CHARGE_RMS_RADIUS;
export const MODEL_BOHR_DISTANCE = (MODEL_NUCLEUS_DIAMETER / 2) * ATOMIC_LENGTH_RATIO;

export const atomicSpaceSources: ScienceSource[] = [
	{
		id: 'atom-space-constants',
		label: 'NIST · 2022 CODATA 기본 물리 상수',
		url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
		accessedAt: '2026-10-23',
		basis:
			'보어 반지름 a₀ = 5.291 772 105 44 × 10⁻¹¹ m, 양성자 전하 RMS 반지름 rₚ = 8.4075 × 10⁻¹⁶ m. 핵의 기준 길이 2rₚ를 1cm로 놓으면 a₀에 해당하는 거리는 약 314.7m, 2a₀에 해당하는 길이는 약 629.4m입니다. 반지름끼리의 비 a₀/rₚ는 약 62,941입니다. RMS 반지름은 전하 분포의 크기 척도이며 딱딱한 표면의 반지름이 아닙니다.'
	},
	{
		id: 'atom-space-hydrogen',
		label: 'OpenStax · University Physics Vol. 3, 8.1 The Hydrogen Atom',
		url: 'https://openstax.org/books/university-physics-volume-3/pages/8-1-the-hydrogen-atom',
		accessedAt: '2026-10-23',
		basis:
			'고정된 핵을 가정한 비상대론적 수소 1s 모형. 공간 확률밀도는 exp(−2r/a₀)/(πa₀³), 거리별 확률밀도는 4r² exp(−2r/a₀)/a₀³입니다. 전자는 정해진 궤도를 돌지 않습니다. 거리별 분포의 최댓값은 r=a₀이며 평균 거리는 이와 다릅니다. 도해와 계산은 이 모형을 사용한 A2O의 독립 제작물입니다.'
	},
	{
		id: 'atom-space-pauli',
		label: 'OpenStax · College Physics 2e, 30.9 The Pauli Exclusion Principle',
		url: 'https://openstax.org/books/college-physics-2e/pages/30-9-the-pauli-exclusion-principle',
		accessedAt: '2026-10-23',
		basis:
			'같은 계의 두 전자는 스핀까지 포함해 완전히 같은 양자 상태를 차지할 수 없습니다. 서로 다른 스핀의 전자 둘이 같은 공간 오비탈을 차지할 수 있으므로, 전자구름이 겹칠 수 없다는 뜻으로 설명하지 않습니다.'
	},
	{
		id: 'atom-space-stability',
		label: 'E. H. Lieb · The stability of matter, Rev. Mod. Phys. 48, 553 (1976)',
		url: 'https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.48.553',
		accessedAt: '2026-10-23',
		basis:
			'논문의 공개 초록을 확인했습니다. 전자와 핵의 쿨롱 상호작용, 양자역학, 파울리 배타 원리가 물질의 안정성에 갖는 역할을 설명하는 근거입니다. 파울리 원리를 별도의 고전적 반발력으로 취급하지 않습니다.'
	},
	{
		id: 'atom-space-football',
		label: 'IFAB · Law 1, 국제 경기의 경기장 크기',
		url: 'https://www.theifab.com/laws/latest/the-field-of-play/',
		accessedAt: '2026-10-23',
		basis:
			'국제 경기용 축구장의 길이는 100~110m입니다. 본문의 “큰 축구장 세 개를 길게 이어 놓은 정도”는 약 315m의 규모를 떠올리기 위한 비교입니다. 모든 축구장이 같은 길이라는 뜻은 아닙니다.'
	}
];
