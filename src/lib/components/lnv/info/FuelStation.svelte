<script>
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { getStations } from "$lib/services/MTSK";

	let { tags, lat, lng } = $props();
</script>

<h3 class="text-lg font-bold mt-2">Fuel Types</h3>
<ul class="flex gap-2 flex-wrap">
	{#each Object.entries(tags).filter(([key]) => key.startsWith("fuel:")) as [key, tag]}
		<!-- <li>{key.replace("fuel:", "")}: {tag}</li> -->
		<Badge>
			{key.replace("fuel:", "")}
			{#if tag !== "yes"}
				({tag})
			{/if}
		</Badge>
	{/each}
</ul>

<h3 class="text-lg font-bold mt-2">Prices</h3>
{#await getStations(lat, lng)}
	<p>Loading fuel prices...</p>
{:then stations}
	{#if stations.stations.length > 0}
		{@const station = stations.stations[0]}
		{#if station.diesel}
			<p>Diesel: {station.diesel}</p>
		{/if}
		{#if station.e10}
			<p>E10: {station.e10}</p>
		{/if}
		{#if station.e5}
			<p>E5: {station.e5}</p>
		{/if}
	{:else}
		<p>No fuel prices available.</p>
	{/if}
{:catch err}
	<p>Error loading fuel prices: {err.message}</p>
{/await}
