<script lang="ts">
	import { GeoJSONSource, LineLayer } from "svelte-maplibre-gl";
	import { routing } from "./routing.svelte";
</script>

{#snippet layer(data: GeoJSON.Feature, id: string, color: string)}
	<GeoJSONSource {id} {data}>
		<LineLayer
			id="{id}-border"
			source={id}
			layout={{ "line-join": "round", "line-cap": "round" }}
			paint={{
				"line-color": "#FFFFFF",
				"line-width": 13,
			}}
		></LineLayer>
		<LineLayer
			{id}
			source={id}
			layout={{ "line-join": "round", "line-cap": "round" }}
			paint={{
				"line-color": color,
				"line-width": 8,
			}}
		></LineLayer>
	</GeoJSONSource>
{/snippet}

{#if routing.geojson.routePast}
	{@render layer(routing.geojson.routePast, "route-past", "#acacac")}
{/if}
{#if routing.geojson.al0}
	{@render layer(routing.geojson.al0, "al0", "#94aad4")}
{/if}
{#if routing.geojson.al1}
	{@render layer(routing.geojson.al1, "al1", "#94aad4")}
{/if}
{#if routing.geojson.route}
	{@render layer(routing.geojson.route, "route", "#3478f6")}
{/if}