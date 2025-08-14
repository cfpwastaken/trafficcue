<script lang="ts">
	import { m } from "$lang/messages";
	import { Button } from "$lib/components/ui/button";
	import {
		decodePolyline,
		routing,
		stopNavigation,
	} from "$lib/services/navigation/routing.svelte";
	import { advertiseRemoteLocation, location } from "../location.svelte";

	// Helper: Haversine distance in meters
	function haversine(
		a: { lat: number; lon: number },
		b: { lat: number; lon: number },
	) {
		const R = 6371000;
		const toRad = (d: number) => (d * Math.PI) / 180;
		const dLat = toRad(b.lat - a.lat);
		const dLon = toRad(b.lon - a.lon);
		const lat1 = toRad(a.lat);
		const lat2 = toRad(b.lat);

		const aVal =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
		return 2 * R * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
	}

	// Helper: Project point onto segment AB, return projected point and distance along segment
	function projectPointToSegment(
		p: WorldLocation,
		a: WorldLocation,
		b: WorldLocation,
	) {
		const toRad = (deg: number) => (deg * Math.PI) / 180;
		const toDeg = (rad: number) => (rad * 180) / Math.PI;

		const lat1 = toRad(a.lat),
			lon1 = toRad(a.lon);
		const lat2 = toRad(b.lat),
			lon2 = toRad(b.lon);
		const lat3 = toRad(p.lat),
			lon3 = toRad(p.lon);

		const dLon = lon2 - lon1;
		const dLat = lat2 - lat1;

		const t =
			((lat3 - lat1) * dLat + (lon3 - lon1) * dLon) /
			(dLat * dLat + dLon * dLon);

		// Clamp to [0,1]
		const clampedT = Math.max(0, Math.min(1, t));

		const latProj = lat1 + clampedT * dLat;
		const lonProj = lon1 + clampedT * dLon;

		return {
			lat: toDeg(latProj),
			lon: toDeg(lonProj),
			t: clampedT,
			distToUser: haversine(p, { lat: toDeg(latProj), lon: toDeg(lonProj) }),
		};
	}

	const shape = $derived(
		decodePolyline(routing.currentTrip?.legs[0].shape || ""),
	);
	// const maneuver = $derived(routing.currentTripInfo.currentManeuver);

	const fullDistance = $derived.by(() => {
		const lat = location.lat;
		const lon = location.lng;
		if (!shape.length) return 0;

		// 1️⃣ find projection onto any segment of the full shape
		let best = { idx: 0, proj: shape[0], dist: Infinity };
		for (let i = 0; i < shape.length - 1; i++) {
			const a = shape[i];
			const b = shape[i + 1];
			const proj = projectPointToSegment({ lat, lon }, a, b);
			if (proj.distToUser < best.dist) {
				best = {
					idx: i,
					proj: { lat: proj.lat, lon: proj.lon },
					dist: proj.distToUser,
				};
			}
		}

		// 2️⃣ sum from the projection point to the very last point
		let total = 0;
		// from projection → next vertex
		total += haversine(best.proj, shape[best.idx + 1]);

		// then each remaining segment
		for (let j = best.idx + 1; j < shape.length - 1; j++) {
			total += haversine(shape[j], shape[j + 1]);
		}

		return total;
	});

	const roundFullDistance = $derived.by(() => {
		const dist = Math.round(fullDistance);
		if (dist < 100) {
			return Math.round(dist / 5) * 5;
		} else if (dist < 1000) {
			return Math.round(dist / 50) * 50;
		} else if (dist < 10000) {
			return Math.round(dist / 100) * 100;
		} else if (dist < 100000) {
			return Math.round(dist / 1000) * 1000;
		} else {
			return Math.round(dist / 5000) * 5000;
		}
	});

	const fullDistanceText = $derived.by(() => {
		const dist = roundFullDistance;
		if (dist < 1000) return `${dist} m`;
		return `${dist / 1000} km`;
	});
</script>

{fullDistanceText}
{m["sidebar.in-route.left"]()}

<Button
	onclick={() => {
		location.toggleLock();
	}}>LOCK</Button
>

<Button
	onclick={() => {
		stopNavigation();
	}}>{m["sidebar.in-route.end-trip"]()}</Button
>

<div class="flex flex-col gap-2 mt-5">
	{#if location.code}
		<span>{m["sidebar.in-route.share-code"]()}: {location.code}</span>
		<Button
			variant="secondary"
			onclick={() => {
				location.advertiser?.close();
				location.advertiser = null;
				location.code = null;
			}}
		>
			{m["sidebar.in-route.stop-sharing"]()}
		</Button>
	{:else}
		<Button
			variant="secondary"
			onclick={() => {
				advertiseRemoteLocation();
			}}
		>
			{m["sidebar.in-route.share-location"]()}
		</Button>
	{/if}
</div>
