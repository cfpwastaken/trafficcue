<script>
	import { m } from "$lang/messages";
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import { getStations } from "$lib/services/MTSK";
	import RequiresCapability from "../RequiresCapability.svelte";

	let { tags, lat, lng } = $props();
</script>

<h3 class="text-lg font-bold mt-2">{m["sidebar.info.fuel-types"]()}</h3>
<ul class="flex gap-2 flex-wrap">
	{#each Object.entries(tags).filter( ([key]) => key.startsWith("fuel:"), ) as [key, tag] (key)}
		<!-- <li>{key.replace("fuel:", "")}: {tag}</li> -->
		{#if tag == "yes"}
			<Badge>
				{key.replace("fuel:", "")}
			</Badge>
		{/if}
	{/each}
</ul>

<RequiresCapability capability="fuel">
	<h3 class="text-lg font-bold mt-2">{m["sidebar.info.prices"]()}</h3>
	{#await getStations(lat, lng)}
		<p>{m.loading()}</p>
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
			<p>{m["sidebar.info.no-prices"]()}</p>
		{/if}
	{:catch err}
		<p>{m["sidebar.info.error-loading-prices"]()}: {err.message}</p>
	{/await}
</RequiresCapability>
