<script lang="ts">
	import { m } from "$lang/messages";
	import Button from "$lib/components/ui/button/button.svelte";
	import { fetchNearbyPOI, type OverpassElement } from "$lib/services/Overpass";
	import { location } from "../location.svelte";
	import { map, pin } from "../map.svelte";
	import SidebarHeader from "./SidebarHeader.svelte";

	let { tags }: { tags?: string } = $props();

	let pois: OverpassElement[] = $state([]);
	let loading = $state(true);

	$effect(() => {
		if (!tags) {
			loading = false;
			pois = [];
			return;
		}
		fetchNearbyPOI(location.lat, location.lng, tags.split(","), 500).then(
			(results) => {
				pois = results.elements.sort((a, b) => {
					const distA = distanceTo(
						a.lat ?? a.center?.lat ?? 0.0,
						a.lon ?? a.center?.lon ?? 0.0,
					);
					const distB = distanceTo(
						b.lat ?? b.center?.lat ?? 0.0,
						b.lon ?? b.center?.lon ?? 0.0,
					);
					return distA - distB;
				});
				loading = false;
			},
		);
	});

	// returns meters
	function distanceTo(lat: number, lon: number) {
		const R = 6371e3; // metres
		const φ1 = (location.lat * Math.PI) / 180; // φ, λ in radians
		const φ2 = (lat * Math.PI) / 180;
		const Δφ = ((lat - location.lat) * Math.PI) / 180;
		const Δλ = ((lon - location.lng) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // in metres
	}
</script>

<SidebarHeader>
	{#if tags}
		{tags.split(",")[0].split("=")[1]?.replace(/_/g, " ") ?? "POIs"}
	{:else}
		{m["sidebar.nearby-poi.header"]()}
	{/if}
</SidebarHeader>

{#if loading}
	<div class="text-sm text-muted-foreground">{m.loading()}</div>
{:else}
	<div class="flex flex-col gap-2 p-2">
		{#if pois.length === 0}
			<div class="text-sm text-muted-foreground">
				{m["sidebar.nearby-poi.no-poi"]()}
			</div>
		{/if}
		{#each pois as poi (poi.id)}
			<Button
				variant="secondary"
				class="w-full flex flex-col items-start h-auto"
				onclick={() => {
					pin.dropPin(
						poi.lat ?? poi.center?.lat ?? 0.0,
						poi.lon ?? poi.center?.lon ?? 0.0,
					);
					pin.showInfo();
					map.value?.flyTo({
						center: [
							poi.lon ?? poi.center?.lon ?? 0.0,
							poi.lat ?? poi.center?.lat ?? 0.0,
						],
						zoom: 19,
					});
				}}
			>
				<div class="font-bold">
					{poi.tags.name ?? poi.tags.brand ?? m.unnamed()}
				</div>
				<div class="text-sm">
					{#if poi.tags.amenity}
						<span class="capitalize">{poi.tags.amenity}</span>
					{/if}
					<span>
						{Math.round(
							distanceTo(
								poi.lat ?? poi.center?.lat ?? 0.0,
								poi.lon ?? poi.center?.lon ?? 0.0,
							),
						)}m
					</span>
				</div>
			</Button>
		{/each}
	</div>
{/if}
