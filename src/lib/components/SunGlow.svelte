<script lang="ts">
	const key = $props.id();
</script>

<defs>
	<radialGradient id={`${key}-halo`}>
		<stop stop-color="#F5CD89" stop-opacity="0" />
		<stop offset=".625" stop-color="#F1BD71" stop-opacity="0" />
		<stop offset=".65" stop-color="#EBA65B" stop-opacity=".24" />
		<stop offset=".78" stop-color="#D99A50" stop-opacity=".09" />
		<stop offset="1" stop-color="#D99A50" stop-opacity="0" />
	</radialGradient>
	<radialGradient id={`${key}-rim`}>
		<stop offset=".927" stop-color="#FFDDA0" stop-opacity="0" />
		<stop offset=".94" stop-color="#FFDDA0" stop-opacity=".32" />
		<stop offset="1" stop-color="#F5BE70" stop-opacity="0" />
	</radialGradient>
</defs>
<!-- Decorative light only. The separately rendered photosphere retains its 100-unit diameter. -->
<circle cx="50" cy="50" r="80" fill={`url(#${key}-halo)`} />
<circle cx="50" cy="50" r="54" fill={`url(#${key}-rim)`} />
