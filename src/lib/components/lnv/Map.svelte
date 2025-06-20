<script lang="ts">
	import { onMount } from "svelte";
	import {
		GeoJSONSource,
		GeolocateControl,
		Hash,
		LineLayer,
		MapLibre,
		Marker,
		Protocol,
	} from "svelte-maplibre-gl";
	import { view } from "./sidebar.svelte";
	import { geolocate, map, pin } from "./map.svelte";
	import {
		drawAllRoutes,
		fetchRoute,
		routing,
	} from "$lib/services/navigation/routing.svelte";
	import { createValhallaRequest } from "$lib/vehicles/ValhallaVehicles";
	import { ROUTING_SERVER } from "$lib/services/hosts";

	onMount(() => {
		window.addEventListener("resize", map.updateMapPadding);
		map.updateMapPadding();
	});
</script>

<Protocol
	scheme="tiles"
	loadFn={async (params) => {
		console.log(params.url);
		const url = params.url.replace("tiles://", "").replace("tiles.openfreemap.org/", "");
		const path = url.split("/")[0];
		if (path == "natural_earth") {
			const t = await fetch("https://tiles.openfreemap.org/" + url);
			if (t.status == 200) {
				const buffer = await t.arrayBuffer();
				return { data: buffer };
			} else {
				throw new Error(`Tile fetch error: ${t.statusText}`);
			}
		} else if (path == "planet") {
			const t = await fetch("https://tiles.openfreemap.org/" + url);
			if (t.status == 200) {
				const buffer = await t.arrayBuffer();
				return { data: buffer };
			} else {
				throw new Error(`Tile fetch error: ${t.statusText}`);
			}
		} else {
			throw new Error("Invalid tiles protocol path");
		}
	}}
/>

<MapLibre
	class="w-full h-full"
	style="/style.json"
	bind:map={map.value}
	padding={map.padding}
	onload={async () => {
		map.updateMapPadding();
	}}
	onclick={(e) => {
		if (view.current.type == "main" || view.current.type == "info") {
			pin.dropPin(e.lngLat.lat, e.lngLat.lng);
			pin.showInfo();
		}
	}}
>
	<!-- <Hash /> -->
	<GeolocateControl
		positionOptions={{
			enableHighAccuracy: true,
		}}
		trackUserLocation={true}
		autoTrigger={true}
		ongeolocate={(e: GeolocationPosition) => {
			const speed = Math.round((e.coords.speed || 0) * 3.6); // In km/h
			const accuracy = Math.round(e.coords.accuracy);
			geolocate.currentLocation = {
				lat: e.coords.latitude,
				lon: e.coords.longitude,
			};
			// $inspect(`Geolocation: ${e.coords.latitude}, ${e.coords.longitude} (Speed: ${speed} km/h, Accuracy: ${accuracy} m)`);
		}}
	/>
	{#if pin.isDropped}
		<Marker lnglat={{ lat: pin.lat, lng: pin.lng }} />
	{/if}

	{#if routing.geojson.routePast}
		<GeoJSONSource id="route-past" data={routing.geojson.routePast}>
			<LineLayer
				id="route-past-border"
				source="route-past"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#FFFFFF",
					"line-width": 13,
				}}
			></LineLayer>
			<LineLayer
				id="route-past"
				source="route-past"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#acacac",
					"line-width": 8,
				}}
			></LineLayer>
		</GeoJSONSource>
	{/if}
	{#if routing.geojson.al0}
		<GeoJSONSource id="al0" data={routing.geojson.al0}>
			<LineLayer
				id="al0-border"
				source="al0"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#FFFFFF",
					"line-width": 13,
				}}
			></LineLayer>
			<LineLayer
				id="al0"
				source="al0"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#94aad4",
					"line-width": 8,
				}}
			></LineLayer>
		</GeoJSONSource>
	{/if}
	{#if routing.geojson.al1}
		<GeoJSONSource id="al1" data={routing.geojson.al1}>
			<LineLayer
				id="al1-border"
				source="al1"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#FFFFFF",
					"line-width": 13,
				}}
			></LineLayer>
			<LineLayer
				id="al1"
				source="al1"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#94aad4",
					"line-width": 8,
				}}
			></LineLayer>
		</GeoJSONSource>
	{/if}
	{#if routing.geojson.route}
		<GeoJSONSource id="route" data={routing.geojson.route}>
			<LineLayer
				id="route-border"
				source="route"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#FFFFFF",
					"line-width": 13,
				}}
			></LineLayer>
			<LineLayer
				id="route"
				source="route"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#3478f6",
					"line-width": 8,
				}}
			></LineLayer>
		</GeoJSONSource>
	{/if}
</MapLibre>
