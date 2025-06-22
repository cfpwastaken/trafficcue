<script lang="ts">
	import { onMount } from "svelte";
	import SidebarHeader from "./SidebarHeader.svelte";
	import {
		drawRoute,
		removeAllRoutes,
		startRoute,
	} from "$lib/services/navigation/routing.svelte";
	import { Button } from "$lib/components/ui/button";
	import { RouteIcon, SaveIcon, SendIcon } from "@lucide/svelte";
	import { map } from "../map.svelte";

	let {
		route,
	}: {
		route: Trip;
	} = $props();

	onMount(() => {
		removeAllRoutes();
		drawRoute(route);
	});
</script>

<SidebarHeader
	onback={() => {
		removeAllRoutes();
	}}
>
	Trip Details
</SidebarHeader>

<div id="actions" class="flex gap-2">
	<Button
		onclick={async () => {
			await startRoute(route);
			requestAnimationFrame(() => {
				map.updateMapPadding();
			});
		}}
	>
		<RouteIcon />
		Start Navigation
	</Button>
	<Button variant="secondary" disabled>
		<SaveIcon />
		Save
	</Button>
	<Button variant="secondary" disabled>
		<SendIcon />
		Send
	</Button>
</div>

<div class="flex flex-col gap-2 mt-2">
	{#each route.legs[0].maneuvers as maneuver (maneuver)}
		<li>
			{maneuver.instruction}
		</li>
	{/each}
</div>
