<script lang="ts">
	import { onMount } from "svelte";
	import {
		MapLibre,
		Marker,
		Protocol,
	} from "svelte-maplibre-gl";
	import { view } from "./sidebar.svelte";
	import { map, pin } from "./map.svelte";
	import {
		decodePolyline,
		routing,
	} from "$lib/services/navigation/routing.svelte";
	import { location } from "./location.svelte";
	import { protocol } from "$lib/services/OfflineTiles";
	import { saved } from "$lib/saved.svelte";
	import RoutingLayers from "$lib/services/navigation/RoutingLayers.svelte";

	onMount(() => {
		window.addEventListener("resize", map.updateMapPadding);
		map.updateMapPadding();
	});

	let locationDot: HTMLDivElement | undefined = $state();
	let locationAccuracyCircle: HTMLDivElement | undefined = $state();
	let homeMarker: HTMLImageElement | undefined = $state();
	let workMarker: HTMLImageElement | undefined = $state();

	const DEBUG_POINTS = false; // Set to true to show debug points on the map
</script>

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
	{#if saved.home && map.zoom > 9}
		<img
			src="/img/saved/home.png"
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
	{#if saved.work && map.zoom > 9}
		<img
			src="/img/saved/work.png"
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
</MapLibre>
