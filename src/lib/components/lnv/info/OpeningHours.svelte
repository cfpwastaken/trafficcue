<script lang="ts">
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import opening_hours from "opening_hours";

	let { hours, lat, lon }: { hours: string, lat: number, lon: number } = $props();

	const oh = $derived.by(() => {
		return new opening_hours(hours, {
			lat, lon, address: {
				country_code: "de", // Default to Germany, can be overridden if needed
				state: "NRW", // Default to North Rhine-Westphalia, can be overridden if needed
			}
		});
	})
</script>

<h3 class="text-lg font-bold mt-2">
	Opening Hours
	{#if oh.getState()}
		<Badge>Open</Badge>
	{:else}
		<Badge variant="destructive">Closed</Badge>
	{/if}
</h3>

<p>{hours}</p>
<!-- todo -->