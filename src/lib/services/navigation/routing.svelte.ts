import { location } from "$lib/components/lnv/location.svelte";
import { map } from "$lib/components/lnv/map.svelte";
import say from "./TTS";
import type { ValhallaRequest } from "./ValhallaRequest";
import type { LngLatBoundsLike } from "maplibre-gl";
import { generateVoiceGuidance } from "./VoiceGuidance";
import { keepScreenOn } from "tauri-plugin-keep-screen-on-api";

export const routing = $state({
	geojson: {
		route: null as GeoJSON.Feature | null,
		routePast: null as GeoJSON.Feature | null,
		al0: null as GeoJSON.Feature | null,
		al1: null as GeoJSON.Feature | null,
	},
	currentTrip: null as Trip | null,
	currentTripInfo: {
		maneuverIdx: 0,
		past: [] as WorldLocation[],
		route: [] as WorldLocation[],
		int: null as NodeJS.Timeout | null,
		isOffRoute: false,
		currentManeuver: null as Maneuver | null,
	},
});

export function resetRouting() {
	routing.geojson.route = null;
	routing.geojson.routePast = null;
	routing.geojson.al0 = null;
	routing.geojson.al1 = null;
}

export async function fetchRoute(server: string, request: ValhallaRequest) {
	try {
		const res = await fetch(
			server + "/route?json=" + JSON.stringify(request),
		).then((res) => res.json());

		console.log(res);
		return res;
	} catch (error) {
		console.error("Error calculating route:", error);
		throw error;
	}
}

function tripToGeoJSON(trip: Trip): GeoJSON.Feature {
	const polyline = decodePolyline(trip.legs[0].shape);
	return {
		type: "Feature",
		properties: {},
		geometry: {
			type: "LineString",
			coordinates: polyline.map((p) => [p.lon, p.lat]),
		},
	};
}

function geometryToGeoJSON(polyline: WorldLocation[]): GeoJSON.Feature {
	return {
		type: "Feature",
		properties: {},
		geometry: {
			type: "LineString",
			coordinates: polyline.map((p) => [p.lon, p.lat]),
		},
	};
}

export function decodePolyline(encoded: string): WorldLocation[] {
	const points = [];
	let index = 0;
	const len = encoded.length;
	let lat = 0;
	let lng = 0;

	while (index < len) {
		let shift = 0;
		let result = 0;
		let byte;
		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += deltaLat;

		shift = 0;
		result = 0;
		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += deltaLng;

		// Convert the latitude and longitude to decimal format with six digits of precision
		points.push({
			lat: lat / 1000000, // Divide by 1,000,000 for six digits of precision
			lon: lng / 1000000, // Divide by 1,000,000 for six digits of precision
		});
	}

	return points;
}

export function drawAllRoutes(trips: Trip[]) {
	routing.geojson.routePast = null;
	routing.geojson.route = tripToGeoJSON(trips[0]);
	if (trips[1]) routing.geojson.al0 = tripToGeoJSON(trips[1]);
	if (trips[2]) routing.geojson.al1 = tripToGeoJSON(trips[2]);
}

export function drawRoute(trip: Trip) {
	routing.geojson.route = tripToGeoJSON(trip);
}

function drawCurrentTrip() {
	if (!routing.currentTrip) return;
	routing.geojson.route = geometryToGeoJSON(routing.currentTripInfo.route);
	routing.geojson.routePast = geometryToGeoJSON(
		routing.currentTripInfo.past.flat(),
	);
}

export async function startRoute(trip: Trip) {
	if (window.__TAURI__) {
		await keepScreenOn(true);
	}
	routing.currentTrip = trip;
	removeAllRoutes();
	routing.geojson.route = tripToGeoJSON(trip);
	routing.currentTripInfo.maneuverIdx = 0;
	routing.currentTripInfo.past = [];
	routing.currentTripInfo.isOffRoute = false;

	drawRoute(trip);
	routing.currentTripInfo.currentManeuver =
		routing.currentTrip.legs[0].maneuvers[0];

	routing.currentTripInfo.int = setInterval(tickRoute, 500);
}

let hasAnnouncedPreInstruction = false;
const USE_LANDMARK_INSTRUCTIONS = false;

async function tickRoute() {
	const trip = routing.currentTrip;
	const info = routing.currentTripInfo;
	if (!trip) return;

	const currentManeuver =
		trip.legs[0].maneuvers[routing.currentTripInfo.maneuverIdx];
	if (!currentManeuver) {
		// No more maneuvers, stop navigation
		stopNavigation();
		return;
	}

	const bgi = currentManeuver.begin_shape_index;
	const loc = {
		lat: location.lat,
		lon: location.lng,
	};
	const polyline = decodePolyline(trip.legs[0].shape);

	// Check if the user location is on the last point of the entire route
	if (isOnPoint(loc, polyline[polyline.length - 1])) {
		console.log("Reached destination!");
		stopNavigation();
		return;
	}

	// Check if the user is on the route
	if (!isOnShape(loc, polyline)) {
		console.log("Off route!");
		info.isOffRoute = true;
		// TODO: Implement re-routing logic
		return;
	} else {
		info.isOffRoute = false;
	}

	if (
		currentManeuver.verbal_pre_transition_instruction &&
		!hasAnnouncedPreInstruction
	) {
		const distanceToEnd = calculateDistance(loc, polyline[bgi]);
		// console.log("Distance to end of current maneuver: ", distanceToEnd, " meters");
		// console.log("Speed: ", location.speed, " km/h");
		const verbalDistance = verbalPreInstructionDistance(
			location.speed || 50, // Assuming location has a speed property
		);
		if (distanceToEnd <= verbalDistance) {
			hasAnnouncedPreInstruction = true;
			const instruction = USE_LANDMARK_INSTRUCTIONS
				? await generateVoiceGuidance(currentManeuver, polyline)
				: currentManeuver.verbal_pre_transition_instruction;
			console.log(
				"[Verbal instruction] ",
				// currentManeuver.verbal_pre_transition_instruction,
				instruction,
			);
			say(instruction);
		}
	}

	// Check if the user is past the current maneuver
	// Checks if the user is still on the current maneuver's polyline
	if (!isOnShape(loc, polyline.slice(bgi))) {
		return; // User is not on the current maneuver's polyline, do not update
	}

	// Update the past and current route polylines
	info.past = polyline.slice(0, bgi + 1);
	info.route = polyline.slice(bgi);

	// Update the geojson
	drawCurrentTrip();

	// announce the "verbal_post_transition_instruction"
	if (currentManeuver.verbal_post_transition_instruction) {
		hasAnnouncedPreInstruction = false;
		const distanceToEnd = calculateDistance(
			loc,
			polyline[
				trip.legs[0].maneuvers[routing.currentTripInfo.maneuverIdx + 1]
					.begin_shape_index
			],
		);
		if (distanceToEnd >= 200) {
			console.log(
				"[Verbal instruction] ",
				currentManeuver.verbal_post_transition_instruction,
			);
			say(currentManeuver.verbal_post_transition_instruction);
		}
	}

	// Advance to the next maneuver
	info.maneuverIdx++;
	if (info.maneuverIdx >= trip.legs[0].maneuvers.length) {
		// No more maneuvers
		stopNavigation();
		return;
	}

	info.currentManeuver = trip.legs[0].maneuvers[info.maneuverIdx];

	// queueSpeech(info.currentManeuver.verbal_pre_transition_instruction || "");
	// queueSpeech(info.currentManeuver.verbal_post_transition_instruction || "");

	// TODO: verbal instructions
}

function verbalPreInstructionDistance(speed: number): number {
	return Math.min(speed, 30) * 2.222 + 37.144;
}

export function stopNavigation() {
	if (routing.currentTripInfo.int) {
		clearInterval(routing.currentTripInfo.int);
		routing.currentTripInfo.int = null;
	}
	routing.currentTrip = null;
	map.updateMapPadding(); // TODO: REMOVE
	removeAllRoutes();
	if (window.__TAURI__) {
		keepScreenOn(false);
	}
}

// function getUserLocation(): WorldLocation {
// 	// return geolocate.currentLocation!;
// 	return {
// 		lat: location.lat,
// 		lon: location.lng,
// 	};
// 	// const lnglat = window.geolocate._userLocationDotMarker.getLngLat();
// 	// return { lat: lnglat.lat, lon: lnglat.lng };
// 	// console.log(map.value!)
// 	// return {
// 	// 	lat: 0,
// 	// 	lon: 0
// 	// }
// }

function isOnLine(
	location: WorldLocation,
	from: WorldLocation,
	to: WorldLocation,
) {
	// Convert the 12-meter tolerance to degrees (approximation)
	const tolerance = 12 / 111320; // 1 degree latitude ≈ 111.32 km

	// Calculate the vector components
	const dx = to.lon - from.lon;
	const dy = to.lat - from.lat;

	// Calculate the projection of the location onto the line segment
	const t =
		((location.lon - from.lon) * dx + (location.lat - from.lat) * dy) /
		(dx * dx + dy * dy);

	// Clamp t to the range [0, 1] to ensure the projection is on the segment
	const clampedT = Math.max(0, Math.min(1, t));

	// Calculate the closest point on the line segment
	const closestPoint = {
		lon: from.lon + clampedT * dx,
		lat: from.lat + clampedT * dy,
	};

	// Calculate the distance from the location to the closest point
	const distance = Math.sqrt(
		Math.pow(location.lon - closestPoint.lon, 2) +
			Math.pow(location.lat - closestPoint.lat, 2),
	);

	// Check if the distance is within the tolerance
	return distance <= tolerance;
}

function isOnPoint(location: WorldLocation, point: WorldLocation) {
	// Convert the 6-meter tolerance to degrees (approximation)
	const tolerance = 6 / 111320; // 1 degree latitude ≈ 111.32 km
	// Calculate the distance from the location to the point
	const distance = Math.sqrt(
		Math.pow(location.lon - point.lon, 2) +
			Math.pow(location.lat - point.lat, 2),
	);
	// Check if the distance is within the tolerance
	return distance <= tolerance;
}

function isOnShape(location: WorldLocation, shape: WorldLocation[]) {
	// Check if the location is on the line between from and to (3 meter tolerance)
	for (let i = 0; i < shape.length - 1; i++) {
		if (isOnLine(location, shape[i], shape[i + 1])) {
			return true;
		}
	}
	return false;
}

function calculateDistance(
	point1: WorldLocation,
	point2: WorldLocation,
): number {
	const R = 6371000; // Earth's radius in meters
	const lat1 = point1.lat * (Math.PI / 180);
	const lat2 = point2.lat * (Math.PI / 180);
	const deltaLat = (point2.lat - point1.lat) * (Math.PI / 180);
	const deltaLon = (point2.lon - point1.lon) * (Math.PI / 180);

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) *
			Math.cos(lat2) *
			Math.sin(deltaLon / 2) *
			Math.sin(deltaLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
}

export function zoomToPoints(
	from: WorldLocation,
	to: WorldLocation,
	map: maplibregl.Map,
) {
	const getBoundingBox = (
		point1: [number, number],
		point2: [number, number],
	): LngLatBoundsLike => {
		const [lng1, lat1] = point1;
		const [lng2, lat2] = point2;

		const sw = [Math.min(lng1, lng2), Math.min(lat1, lat2)] as [number, number];
		const ne = [Math.max(lng1, lng2), Math.max(lat1, lat2)] as [number, number];

		return [sw, ne];
	};

	map.fitBounds(getBoundingBox([from.lon, from.lat], [to.lon, to.lat]), {
		padding: 40,
	});
}

export function removeAllRoutes() {
	routing.geojson.route = null;
	routing.geojson.routePast = null;
	routing.geojson.al0 = null;
	routing.geojson.al1 = null;
}
