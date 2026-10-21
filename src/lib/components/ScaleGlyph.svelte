<script lang="ts">
	import { SATURN_RINGS_KM as rings } from '$lib/data/science-planets';
	import { ringBand } from '$lib/utils/planet-geometry';
	import FootballGlyph from './FootballGlyph.svelte';
	import MicroGlyph from './MicroGlyph.svelte';
	import EverydayGlyph from './EverydayGlyph.svelte';
	import WhaleGlyph from './WhaleGlyph.svelte';
	import StructureGlyph from './StructureGlyph.svelte';
	import SmallBodyGlyph from './SmallBodyGlyph.svelte';
	import PlanetSurface from './PlanetSurface.svelte';
	import LeadGlyph from './LeadGlyph.svelte';
	import TableGlyph from './TableGlyph.svelte';
	import SunGlyph from './SunGlyph.svelte';
	let { id }: { id: string } = $props();
	const clipId = $props.id();
	// Reference-based local vectors; see docs/SVG_SHAPE_REVIEW.md for the per-object audit.
</script>

{#if id === 'atom'}
	<g fill="none" stroke="#8DB5B2" stroke-width="1">
		<ellipse cx="50" cy="45" rx="43" ry="14" transform="rotate(-26 50 45)" />
		<ellipse cx="50" cy="45" rx="35" ry="23" transform="rotate(38 50 45)" />
	</g>
	<circle cx="50" cy="45" r="5" />
	<path d="M0 90H100M0 85V95M100 85V95" fill="none" stroke="#E6BB82" stroke-width="1" />
{:else if ['dna', 'virus', 'red-cell', 'hair'].includes(id)}
	<MicroGlyph {id} />
{:else if id === 'ecoli'}
	<rect x="0" y="0" width="100" height="43" rx="21.5" />
	<rect
		x="4"
		y="4"
		width="92"
		height="35"
		rx="17.5"
		fill="#4B7168"
		stroke="#C4D2B6"
		stroke-width="1"
	/>
	<path
		d="M22 20C25 8 38 33 43 19S60 29 67 17 81 22 82 25"
		fill="none"
		stroke="#BAC7A2"
		stroke-width="2"
	/>
	<g fill="#C7D5BB" opacity=".65">
		{#each [[18, 13], [27, 29], [40, 9], [53, 32], [63, 10], [75, 31], [85, 16]] as [x, y] (x)}<circle
				cx={x}
				cy={y}
				r="1.2"
			/>{/each}
	</g>
{:else if id === 'lead'}
	<LeadGlyph />
{:else if id === 'table'}
	<TableGlyph />
{:else if id === 'sun'}
	<SunGlyph />
{:else if ['battery', 'coin'].includes(id)}
	<EverydayGlyph {id} />
{:else if id === 'football'}
	<FootballGlyph />
{:else if id === 'whale'}
	<WhaleGlyph />
{:else if ['iss', 'tower'].includes(id)}
	<StructureGlyph {id} />
{:else if ['phobos', 'vesta'].includes(id)}
	<SmallBodyGlyph {id} />
{:else if ['earth', 'moon', 'mercury', 'venus', 'mars', 'neptune', 'jupiter'].includes(id)}
	<PlanetSurface {id} />
{:else if id === 'saturn'}
	<defs><clipPath id={clipId}><circle cx="50" cy="50" r="50" /></clipPath></defs>
	<g data-testid="saturn-rings" transform="rotate(-17 50 50)" fill-rule="evenodd">
		<path d={ringBand(rings.cInner, rings.bOuter)} fill="#8D8C79" />
		<path d={ringBand(rings.aInner, rings.aOuter)} fill="#C2B38F" />
		<path d={ringBand(rings.bInner, rings.bOuter)} fill="#C9BA98" />
	</g>
	<g clip-path={`url(#${clipId})`}>
		<circle data-testid="planet-disc" cx="50" cy="50" r="50" />
		<path
			d="M1 25Q50 15 99 25M0 41Q50 32 100 41M0 66Q50 76 100 66M10 82Q50 89 90 82"
			fill="none"
			stroke="#A79A7C"
			stroke-width="5"
		/>
		<path d="M5 34Q50 28 95 34M1 55Q50 59 99 55" fill="none" stroke="#D7CBAA" stroke-width="2" />
		<path d="M50 1C78 5 88 28 88 50S76 91 50 99Q100 99 100 50T50 1" fill="#746F62" opacity=".16" />
	</g>
	<g transform="rotate(-17 50 50)">
		<path d={ringBand(rings.cInner, rings.bOuter, true)} fill="#8D8C79" />
		<path d={ringBand(rings.aInner, rings.aOuter, true)} fill="#C2B38F" />
		<path d={ringBand(rings.bInner, rings.bOuter, true)} fill="#C9BA98" />
	</g>
{:else}
	<defs><clipPath id={clipId}><circle cx="50" cy="50" r="50" /></clipPath></defs>
	<g clip-path={'url(#' + clipId + ')'}>
		<circle cx="50" cy="50" r="50" />
		{#if id === 'ball'}
			<defs>
				<radialGradient id={`${clipId}-matte`} cx="35%" cy="30%" r="85%">
					<stop stop-color="#F7F6EF" />
					<stop offset=".6" stop-color="#EFEFE7" />
					<stop offset="1" stop-color="#DDE0D8" />
				</radialGradient>
				<radialGradient id={`${clipId}-diffuse-shadow`} cx="32%" cy="28%" r="80%">
					<stop stop-color="#102832" stop-opacity="0" />
					<stop offset=".48" stop-color="#102832" stop-opacity="0" />
					<stop offset=".7" stop-color="#102832" stop-opacity=".035" />
					<stop offset=".85" stop-color="#102832" stop-opacity=".15" />
					<stop offset="1" stop-color="#102832" stop-opacity=".34" />
				</radialGradient>
			</defs>
			<circle cx="50" cy="50" r="50" fill={`url(#${clipId}-matte)`} />
			<circle cx="50" cy="50" r="50" fill={`url(#${clipId}-diffuse-shadow)`} />
		{:else if id === 'uranus'}
			<path
				d="M-7 31Q45 16 107 30M-8 48Q45 38 107 49M-5 69Q50 59 105 72"
				fill="none"
				stroke="#C5D9CE"
				stroke-width="4"
				opacity=".3"
			/>
			<path
				d="M14 17Q39 2 64 13M6 42Q42 31 77 42"
				fill="none"
				stroke="#D6E3D7"
				stroke-width="1.2"
				opacity=".55"
			/>
			<path
				d="M50 0C86 4 87 30 87 50S74 92 50 100Q100 100 100 50T50 0"
				fill="#548F98"
				opacity=".18"
			/>
		{/if}
	</g>
{/if}
