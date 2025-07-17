<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { POIIcons } from "$lib/POIIcons";
	import {
		BriefcaseIcon,
		EllipsisIcon,
		GlobeIcon,
		HomeIcon,
		MailIcon,
		PhoneIcon,
		RouteIcon,
		SchoolIcon,
	} from "@lucide/svelte";
	import { pin } from "../map.svelte";
	import SidebarHeader from "./SidebarHeader.svelte";
	import { fetchPOI, type OverpassElement } from "$lib/services/Overpass";
	import OpeningHours from "../info/OpeningHours.svelte";
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import FuelStation from "../info/FuelStation.svelte";
	import { view } from "../sidebar.svelte";
	import * as Popover from "$lib/components/ui/popover";
	import Reviews from "../info/Reviews.svelte";
	import MapAi from "../info/MapAI.svelte";
	import RequiresCapability from "../RequiresCapability.svelte";
	import { saved, saveLocations } from "$lib/saved.svelte";

	// let { feature }: { feature: Feature } = $props();

	// let Icon = $derived(POIIcons[feature.properties.osm_key + "=" + feature.properties.osm_value]);

	let { lat, lng }: { lat: number; lng: number } = $props();

	function getIcon(
		tags: Record<string, string>,
	): (typeof POIIcons)[keyof typeof POIIcons] | null {
		const key = Object.keys(tags).find(
			(k) => k.startsWith("amenity") || k.startsWith("shop"),
		);
		if (key && POIIcons[key + "=" + tags[key]]) {
			return POIIcons[key + "=" + tags[key]];
		}
		return null;
	}

	function getDistance(
		aLat: number,
		aLon: number,
		lat: number,
		lon: number,
	): number {
		const R = 6371e3; // Earth radius in meters
		const φ1 = (lat * Math.PI) / 180;
		const φ2 = (aLat * Math.PI) / 180;
		const Δφ = ((aLat - lat) * Math.PI) / 180;
		const Δλ = ((aLon - lon) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) ** 2 +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	function sortByDistance(
		elements: OverpassElement[],
		lat: number,
		lng: number,
	): OverpassElement[] {
		return elements.sort((a: OverpassElement, b: OverpassElement) => {
			const aLoc = a.center || a;
			const bLoc = b.center || b;
			return (
				getDistance(aLoc.lat!, aLoc.lon!, lat, lng) -
				getDistance(bLoc.lat!, bLoc.lon!, lat, lng)
			);
		});
	}
</script>

{#await fetchPOI(lat, lng, 20)}
	<SidebarHeader
		onback={() => {
			pin.liftPin();
		}}
	>
		Dropped Pin
	</SidebarHeader>
	<p>Loading...</p>
{:then res}
	{#if res.elements.length === 0}
		<SidebarHeader
			onback={() => {
				pin.liftPin();
			}}
		>
			Dropped Pin
		</SidebarHeader>
		<span style="color: #acacac;">&copy; OpenStreetMap</span>
		<pre>{JSON.stringify(res, null, 2)}</pre>
	{:else}
		{@const elements = sortByDistance(res.elements, lat, lng)}
		{@const tags = elements[0].tags}
		{@const firstElement = elements[0]}
		{@const ellat = firstElement.center?.lat || firstElement.lat!}
		{@const ellng = firstElement.center?.lon || firstElement.lon!}

		<SidebarHeader
			onback={() => {
				pin.liftPin();
			}}
		>
			{#if getIcon(tags)}
				{@const Icon = getIcon(tags)}
				<Icon />
			{/if}
			{tags.name ||
				(tags["addr:street"]
					? tags["addr:street"] + " " + tags["addr:housenumber"]
					: "")}
		</SidebarHeader>
		<div id="actions">
			<Button
				onclick={() => {
					view.switch("route", {
						to: lat + "," + lng,
					});
				}}
			>
				<RouteIcon />
				Route
			</Button>
			{#if tags.email || tags["contact:email"]}
				<Button
					variant="secondary"
					href={`mailto:${tags.email || tags["contact:email"]}`}
					target="_blank"
				>
					<MailIcon />
					Email
				</Button>
			{/if}
			{#if tags.website || tags["contact:website"]}
				<Button
					variant="secondary"
					href={tags.website || tags["contact:website"]}
					target="_blank"
				>
					<GlobeIcon />
					Website
				</Button>
			{/if}
			{#if tags.phone || tags["contact:phone"]}
				<Button
					variant="secondary"
					href={`tel:${tags.phone || tags["contact:phone"]}`}
					target="_blank"
				>
					<PhoneIcon />
					Call
				</Button>
			{/if}
			<Popover.Root>
				<Popover.Trigger>
					<Button variant="secondary">
						<EllipsisIcon />
						More
					</Button>
				</Popover.Trigger>
				<Popover.Content>
					<div class="flex flex-col gap-2">
						<Button
							variant="outline"
							onclick={() => {
								// localStorage.setItem(
								// 	"saved.home",
								// 	JSON.stringify({ lat, lon: lng }),
								// );
								saved.home = { lat, lon: lng };
								saveLocations();
							}}
						>
							<HomeIcon />
							Set as Home
						</Button>
						<Button
							variant="outline"
							onclick={() => {
								saved.school = { lat, lon: lng };
								saveLocations();
							}}
						>
							<SchoolIcon />
							Set as School
						</Button>
						<Button
							variant="outline"
							onclick={() => {
								// localStorage.setItem(
								// 	"saved.work",
								// 	JSON.stringify({ lat, lon: lng }),
								// );
								saved.work = { lat, lon: lng };
								saveLocations();
							}}
						>
							<BriefcaseIcon />
							Set as Work
						</Button>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>

		<RequiresCapability capability="ai">
			<MapAi lat={ellat} lon={ellng} />
		</RequiresCapability>

		<!-- 
		"addr:city": "Hagen",
      "addr:housenumber": "12",
      "addr:postcode": "58135",
      "addr:street":  -->
		<p class="mt-2">{tags["addr:street"]} {tags["addr:housenumber"]}</p>
		<p>{tags["addr:postcode"]} {tags["addr:city"]}</p>

		{#if tags.opening_hours}
			<OpeningHours hours={tags.opening_hours} {lat} lon={lng} />
		{/if}

		{#if tags.amenity == "fuel"}
			<RequiresCapability capability="fuel">
				<FuelStation {tags} {lat} {lng} />
			</RequiresCapability>
		{/if}

		<!-- any payment:* tag -->
		{#if Object.keys(tags).some((key) => key.startsWith("payment:"))}
			<h3 class="text-lg font-bold mt-2">Payment Methods</h3>
			<ul style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
				{#each Object.entries(tags).filter( ([key]) => key.startsWith("payment:"), ) as [key, value] (key)}
					<Badge>{key.replace("payment:", "")}: {value}</Badge>
				{/each}
			</ul>
		{/if}

		<RequiresCapability capability="reviews">
			<Reviews lat={ellat} lng={ellng} />
		</RequiresCapability>

		<span style="color: #acacac;">&copy; OpenStreetMap</span>

		<pre>{JSON.stringify(elements, null, 2)}</pre>
	{/if}
{:catch err}
	<SidebarHeader
		onback={() => {
			pin.liftPin();
		}}
	>
		Dropped Pin
	</SidebarHeader>
	<p>Error: {err.message}</p>
{/await}

<style>
	#actions {
		display: flex;
		gap: 0.5rem;
		overflow-y: scroll;
	}
</style>
