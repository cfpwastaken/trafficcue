<script lang="ts">
	import { onMount } from "svelte";
	import { MapLibre, Marker, Protocol } from "svelte-maplibre-gl";
	import { view } from "./view.svelte";
	import { map, pin } from "./map.svelte";
	import {
		decodePolyline,
		routing,
	} from "$lib/services/navigation/routing.svelte";
	import { location } from "./location.svelte";
	import { saved } from "$lib/saved.svelte";
	import RoutingLayers from "$lib/services/navigation/RoutingLayers.svelte";
	import { getPMTilesURL, hasPMTiles, protocol } from "$lib/services/OfflineTiles";
	import { layers, worldLayers } from "$lib/mapLayers";
	import { PMTilesProtocol } from "svelte-maplibre-gl/pmtiles";

	onMount(() => {
		window.addEventListener("resize", map.updateMapPadding);
		map.updateMapPadding();
	});

	let locationDot: HTMLDivElement | undefined = $state();
	let locationAccuracyCircle: HTMLDivElement | undefined = $state();
	let homeMarker: HTMLImageElement | undefined = $state();
	let workMarker: HTMLImageElement | undefined = $state();
	let schoolMarker: HTMLImageElement | undefined = $state();

	const DEBUG_POINTS = false; // Set to true to show debug points on the map
</script>

<!-- <Protocol scheme="tiles" loadFn={protocol} /> -->
<PMTilesProtocol />
<Protocol scheme="tiles" loadFn={protocol} />

<MapLibre
	class="w-full h-full"
	style="/style.json"
	bind:map={map.value}
	bind:zoom={map.zoom}
	padding={map.padding}
	onload={async () => {
		map.updateMapPadding();
		location.locked = true;
		// @ts-expect-error - not typed
		window.map = map.value;
    
    // const worldUrl = await getPMTiles("world");
    // if(worldUrl) {
      map.value!.addSource("ne2_shaded", { // TODO: rename to world
        type: "vector",
        url: await getPMTilesURL("world"),
        attribution: "Natural Earth",
//        maxzoom: 6
      })

			// @ts-expect-error - not typed correctly
      worldLayers.forEach(l => map.value!.addLayer(l));
    // }

		// const url = await getPMTiles("tiles");
    // console.log(url)
		// if(url) {
			map.value!.addSource("openmaptiles", {
				type: "vector",
				url: await hasPMTiles("tiles") ? await getPMTilesURL("tiles") : "pmtiles://https://trafficcue-tiles.picoscratch.de/germany.pmtiles"
			})


			// @ts-expect-error - not typed correctly
			layers.forEach(l => map.value!.addLayer(l));
		// }
	}}
	onclick={(e) => {
		if (view.current.type == "main" || view.current.type == "info") {
			pin.dropPin(e.lngLat.lat, e.lngLat.lng);
			pin.showInfo();
		}
	}}
	onmove={(e) => {
		// @ts-expect-error - not typed
		if (e.reason !== "location") {
			location.locked = false;
		}
	}}
>
	{#if routing.currentTrip && DEBUG_POINTS}
		<!-- {#each decodePolyline(routing.currentTrip!.legs[0].shape) as point (point)}
			<Marker
				lnglat={{ lat: point.lat, lng: point.lon }}
				color="orange"
			/>
		{/each} -->
		<Marker
			lnglat={{
				lat: decodePolyline(routing.currentTrip!.legs[0].shape)[
					routing.currentTripInfo.currentManeuver!.begin_shape_index
				].lat,
				lng: decodePolyline(routing.currentTrip!.legs[0].shape)[
					routing.currentTripInfo.currentManeuver!.begin_shape_index
				].lon,
			}}
			color="lime"
		/>
		<Marker
			lnglat={{
				lat: decodePolyline(routing.currentTrip!.legs[0].shape)[
					routing.currentTripInfo.currentManeuver!.end_shape_index
				].lat,
				lng: decodePolyline(routing.currentTrip!.legs[0].shape)[
					routing.currentTripInfo.currentManeuver!.end_shape_index
				].lon,
			}}
			color="red"
		/>
	{/if}
	{#if pin.isDropped}
		<Marker lnglat={{ lat: pin.lat, lng: pin.lng }} />
	{/if}

	<RoutingLayers />

	{#if location.available}
		<div class="maplibregl-user-location-dot" bind:this={locationDot}></div>
		<div
			class="maplibregl-user-location-accuracy-circle"
			bind:this={locationAccuracyCircle}
		></div>
		<Marker
			lnglat={{ lat: location.lat, lng: location.lng }}
			element={locationDot}
		/>
		<Marker
			lnglat={{ lat: location.lat, lng: location.lng }}
			element={locationAccuracyCircle}
		/>
	{/if}

	{#if saved.home}
		<img
			src={map.zoom > 9 ? "/img/saved/home.png" : "/img/saved/small.png"}
			alt="Home Marker"
			bind:this={homeMarker}
			style="width: 32px;"
		/>
		<Marker
			lnglat={{
				lat: saved.home.lat,
				lng: saved.home.lon,
			}}
			element={homeMarker}
		/>
	{/if}
	{#if saved.school}
		<img
			src={map.zoom > 9 ? "/img/saved/school.png" : "/img/saved/small.png"}
			alt="School Marker"
			bind:this={schoolMarker}
			style="width: 32px;"
		/>
		<Marker
			lnglat={{
				lat: saved.school.lat,
				lng: saved.school.lon,
			}}
			element={schoolMarker}
		/>
	{/if}
	{#if saved.work}
		<img
			src={map.zoom > 9 ? "/img/saved/work.png" : "/img/saved/small.png"}
			alt="Work Marker"
			bind:this={workMarker}
			style="width: 32px;"
		/>
		<Marker
			lnglat={{
				lat: saved.work.lat,
				lng: saved.work.lon,
			}}
			element={workMarker}
		/>
	{/if}
</MapLibre>
