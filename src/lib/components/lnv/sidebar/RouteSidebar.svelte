<script lang="ts">
	import { CircleArrowDown, CircleDotIcon, StarIcon } from "@lucide/svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import SidebarHeader from "./SidebarHeader.svelte";
	import { Button } from "$lib/components/ui/button";
	import { createValhallaRequest } from "$lib/vehicles/ValhallaVehicles";
	import {
		drawAllRoutes,
		fetchRoute,
		removeAllRoutes,
		zoomToPoints,
	} from "$lib/services/navigation/routing.svelte";
	import { ROUTING_SERVER } from "$lib/services/hosts";
	import { map } from "../map.svelte";
	import { view } from "../view.svelte";
	import {
		DefaultVehicle,
		selectedVehicle,
	} from "$lib/vehicles/vehicles.svelte";
	import { location } from "../location.svelte";
	import { saved } from "$lib/saved.svelte";
	import { m } from "$lang/messages";

	let {
		from,
		to,
	}: {
		from?: string;
		to?: string;
	} = $props();

	let fromLocation = $state(from || "");
	let toLocation = $state(to || "");

	let routes: Trip[] | null = $state(null);

	function formatTime(seconds: number) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		// const secs = seconds % 60;
		return `${hours != 0 ? hours + "h " : ""}${minutes}min`;
	}
</script>

<SidebarHeader
	onback={() => {
		removeAllRoutes();
	}}
>
	{m["sidebar.route.header"]()}
</SidebarHeader>

<span
	>{m["sidebar.route.driving-with"]()}
	<strong>{(selectedVehicle() ?? DefaultVehicle).name}</strong></span
>
<div class="flex flex-col gap-2 w-full mb-2">
	<div class="flex gap-2 items-center w-full">
		<CircleDotIcon />
		<Input bind:value={fromLocation} />
	</div>
	<div class="flex items-center justify-center w-full">
		<CircleArrowDown />
	</div>
	<div class="flex gap-2 items-center w-full">
		<CircleDotIcon />
		<Input bind:value={toLocation} />
	</div>
	<span>
		<!-- eslint-disable-next-line -->
		{@html m["sidebar.route.help"]()}
	</span>
</div>
<Button
	onclick={async () => {
		const FROM: WorldLocation =
			fromLocation == "current"
				? { lat: location.lat, lon: location.lng }
				: fromLocation == "home"
					? saved.home
					: fromLocation == "work"
						? saved.work
						: {
								lat: parseFloat(fromLocation.split(",")[0]),
								lon: parseFloat(fromLocation.split(",")[1]),
							};
		const TO: WorldLocation =
			toLocation == "current"
				? { lat: location.lat, lon: location.lng }
				: toLocation == "home"
					? saved.home
					: toLocation == "work"
						? saved.work
						: {
								lat: parseFloat(toLocation.split(",")[0]),
								lon: parseFloat(toLocation.split(",")[1]),
							};
		const req = createValhallaRequest(selectedVehicle() ?? DefaultVehicle, [
			FROM,
			TO,
		]);
		const res = await fetchRoute(ROUTING_SERVER, req);
		routes = [res.trip];
		if (res.alternates) {
			for (const alternate of res.alternates) {
				if (alternate.trip) {
					routes.push(alternate.trip);
				}
			}
		}
		drawAllRoutes(routes);
		zoomToPoints(FROM, TO, map.value!);
	}}>{m["sidebar.route.calculate"]()}</Button
>

{#if routes}
	<div class="mt-2 flex gap-2 flex-col">
		{#each routes as route, i (route?.summary?.length)}
			<Button
				variant="secondary"
				onclick={() => {
					view.switch("trip", { route });
				}}
			>
				{#if i == 0}
					<StarIcon />
				{/if}
				{Math.round(route.summary.length)}km - {formatTime(
					Math.round(route.summary.time),
				)}
			</Button>
		{/each}
	</div>
{/if}
