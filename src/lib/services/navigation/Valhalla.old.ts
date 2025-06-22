/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import maplibregl from "maplibre-gl";
// import { maneuverTypes } from "./Maneuver";
import {
	hideRouteStatus,
	updateRouteStatus,
} from "../../components/routestatus";
import {
	NavigationLayer,
	removeAllNavigationLayers,
	updateNavigationLayer,
} from "./NavigationLayers";
import { updateMapPadding } from "../../main";
import say from "../TTS";
import { ROUTING_SERVER } from "../servers";
import { createValhallaRequest } from "./ValhallaRequest";
import { Vehicle } from "../../components/vehicles";
import { KeepAwake } from "@capacitor-community/keep-awake";
import {
	getCurrentViewName,
	getSidebarView,
} from "../../components/sidebar/SidebarRegistry";
// import { displayLane } from "./LaneDisplay";

export async function fetchRoute(
	vehicle: Vehicle,
	from: WorldLocation,
	to: WorldLocation,
): Promise<RouteResult> {
	// const req = {
	// 	locations: [
	// 		from,
	// 		to,
	// 	],
	// 	costing: "motor_scooter",
	// 	units: "kilometers",
	// 	language: "de-DE",
	// 	alternates: 2,
	// 	costing_options: {
	// 		"motor_scooter": {
	// 			top_speed: 45,
	// 		},
	// 	},
	// };
	const req = createValhallaRequest(vehicle, [from, to]);

	try {
		const res = await fetch(
			ROUTING_SERVER + "/route?json=" + JSON.stringify(req),
		).then((res) => res.json());

		console.log(res);
		return res;
	} catch (e) {
		console.error(e);
		alert(e);
		throw new Error("Error fetching route");
	}
}

let currentTrip: Trip | null = null;
let instructionIdx = 0;
let currentManeuver: Maneuver | null = null;
let fromMarker: maplibregl.Marker;
let toMarker: maplibregl.Marker;

export function getCurrentTrip() {
	return currentTrip;
}

export function getCurrentManeuver() {
	return currentManeuver;
}

function drawRoute(trip: Trip, name: NavigationLayer) {
	const geometry = decodePolyline(trip.legs[0].shape);
	console.log(geometry);
	updateNavigationLayer(name, geometry);
}

export async function findRoute(
	vehicle: Vehicle,
	from: WorldLocation,
	to: WorldLocation,
): Promise<Trip[]> {
	fromMarker = new maplibregl.Marker()
		.setLngLat([from.lon, from.lat])
		.addTo(window.glmap);
	toMarker = new maplibregl.Marker()
		.setLngLat([to.lon, to.lat])
		.addTo(window.glmap);
	const route = await fetchRoute(vehicle, from, to);

	let routes = [route.trip];
	if (route.alternates) {
		for (let i = 0; i < route.alternates.length; i++) {
			routes.push(route.alternates[i].trip);
		}
	}

	drawAllRoutes(routes);

	return routes;
}

export async function drawAllRoutes(trips: Trip[]) {
	removeAllNavigationLayers();
	// if (result.alternates) {
	// 	for (let i = 0; i < result.alternates.length; i++) {
	// 		// @ts-ignore
	// 		drawRoute(result.alternates[i].trip, "al" + i);
	// 	}
	// }
	// drawRoute(result.trip, "route");
	for (let i = 1; i < trips.length; i++) {
		// @ts-ignore
		drawRoute(trips[i], "al" + (i - 1));
	}
	drawRoute(trips[0], "route");
}

export async function drawSingleRoute(trip: Trip) {
	removeAllNavigationLayers();
	drawRoute(trip, "route");
}

function getUserLocation(): WorldLocation {
	// @ts-ignore
	const lnglat = window.geolocate._userLocationDotMarker.getLngLat();
	return { lat: lnglat.lat, lon: lnglat.lng };
}

// let putMarker = false;
let pastRoute: WorldLocation[] = [];

// Check if the location is on the line between from and to (3 meter tolerance)
function isOnLine(
	location: WorldLocation,
	from: WorldLocation,
	to: WorldLocation,
) {
	// Convert the 6-meter tolerance to degrees (approximation)
	const tolerance = 6 / 111320; // 1 degree latitude ≈ 111.32 km

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

function isOnShape(location: WorldLocation, shape: WorldLocation[]) {
	// Check if the location is on the line between from and to (3 meter tolerance)
	for (let i = 0; i < shape.length - 1; i++) {
		if (isOnLine(location, shape[i], shape[i + 1])) {
			return true;
		}
	}
	return false;
}

let int: number | null = null;

export async function startNavigation(trip: Trip) {
	console.log("Start navigation");
	await KeepAwake.keepAwake();
	document.querySelector<HTMLDivElement>("#map-overlay")!.style.display = "";
	document.querySelector<HTMLBodyElement>("body")!.classList.add("isInTrip");
	updateMapPadding();
	instructionIdx = 0;
	pastRoute = [];
	// Delete all route and alternate route layers (if they exist)
	removeAllNavigationLayers();

	// Add this route to the layer
	const geometry = decodePolyline(trip.legs[0].shape);
	updateNavigationLayer("route", geometry);

	// @ts-ignore The types are not correct
	int = setInterval(() => {
		if (instructionIdx != 0) {
			// Only continue if the user location is at the end shape index of the current maneuver
			if (currentManeuver == null) {
				return;
			}
			const bgi = currentManeuver.begin_shape_index;
			const location = getUserLocation();
			const polyline = decodePolyline(trip.legs[0].shape);
			// const begin = polyline[bgi];

			// const distance = Math.sqrt(
			// 	Math.pow(location.lat - begin.lat, 2) + Math.pow(location.lon - begin.lon, 2),
			// );

			// console.log(distance);
			// // If within 3 meters of the end of the maneuver, go to the next maneuver
			// if (distance > 0.00003) {
			// 	return;
			// }

			// Check if rerouting is needed/the user is off the route
			if (!isOnShape(location, polyline)) {
				console.log("Off route!");

				updateRouteStatus({
					time: trip.summary.time,
					distance: trip.summary.length,
					currentManeuver: {
						...currentManeuver,
						instruction: "Off route!",
					},
				});
				// TODO: Implement rerouting
			} else {
				updateRouteStatus({
					time: trip.summary.time,
					distance: trip.summary.length,
					currentManeuver,
				});
			}

			// Check if the user finished the maneuver
			if (!isOnShape(location, polyline.slice(bgi))) {
				return;
			}

			// Update past route (for the past route line)
			// It needs to basically connect to the now removed part of the route
			// This is a bad example: pastRoute.push(...polyline.slice(0, bgi));   because it only adds a half of the route
			// This is a better example:
			// pastRoute.push(...polyline.slice(0, bgi + 1));
			pastRoute = polyline.slice(0, bgi + 1);

			updateNavigationLayer("route-past", pastRoute.flat());

			// Remove from shape begin to end from the route line
			const newShape = polyline.slice(bgi);
			updateNavigationLayer("route", newShape);
		}

		instructionIdx++;
		// instructionIdx = 6;
		if (trip.legs[0].maneuvers.length <= instructionIdx) {
			stopNavigation();
			return;
		}
		const maneuver = trip.legs[0].maneuvers[instructionIdx];
		updateRouteStatus(
			{
				time: trip.summary.time,
				distance: trip.summary.length,
				currentManeuver: trip.legs[0].maneuvers[instructionIdx],
			},
			maneuver.lanes,
		);
		currentManeuver = maneuver;

		// document.querySelector<HTMLDivElement>("#lanes")!.innerHTML = "";
		// if(currentManeuver.lanes) {
		// 	console.log("Lanes: ", currentManeuver.lanes);
		// 	for(let i = 0; i < currentManeuver.lanes.length; i++) {
		// 		const lane = currentManeuver.lanes[i];
		// 		displayLane(lane).then((laneDiv) => {
		// 			// Add the lane div to the lanes container
		// 			document.querySelector<HTMLDivElement>("#lanes")!.appendChild(laneDiv);
		// 		});
		// 	}
		// }

		// say(maneuver.instruction)
		// Say the verbal post instruction of the previous maneuver
		if (instructionIdx > 0) {
			const prevManeuver = trip.legs[0].maneuvers[instructionIdx - 1];
			if (prevManeuver.verbal_post_transition_instruction) {
				console.log(
					"Saying: " + prevManeuver.verbal_post_transition_instruction,
				);
				say(prevManeuver.verbal_post_transition_instruction);
			}
		}
	}, 1000);

	updateRouteStatus(
		{
			time: trip.summary.time,
			distance: trip.summary.length,
			currentManeuver: trip.legs[0].maneuvers[0],
		},
		trip.legs[0].maneuvers[0].lanes,
	);
	currentTrip = trip;
}

export async function stopNavigation() {
	if (int) clearInterval(int);
	await KeepAwake.allowSleep();
	hideRouteStatus();
	document.querySelector<HTMLBodyElement>("body")!.classList.remove("isInTrip");
	updateMapPadding();
	currentTrip = null;
	currentManeuver = null;
	removeAllNavigationLayers();
	try {
		fromMarker.remove();
		toMarker.remove();
	} catch (e) {}
	getSidebarView(getCurrentViewName()!).switchTo();
}

export function kmToString(km: number) {
	if (km < 1) {
		return Math.round(km * 100) + "m";
	}
	return Math.round(km) + "km";
}

export function decodePolyline(encoded: string): WorldLocation[] {
	let points = [];
	let index = 0;
	let len = encoded.length;
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

		let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += deltaLat;

		shift = 0;
		result = 0;
		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += deltaLng;

		// Convert the latitude and longitude to decimal format with six digits of precision
		points.push({
			lat: lat / 1000000, // Divide by 1,000,000 for six digits of precision
			lon: lng / 1000000, // Divide by 1,000,000 for six digits of precision
		});
	}

	return points;
}
