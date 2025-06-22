import { LNV_SERVER } from "$lib/services/hosts"
import { routing } from "$lib/services/navigation/routing.svelte"
import { map } from "./map.svelte"

export const location = $state({
	available: false,
	lat: 0,
	lng: 0,
	accuracy: 0,
	speed: 0,
	heading: null as number | null,
	provider: "gps" as "gps" | "remote" | "simulated",
	locked: true,
	toggleLock: () => {
		location.locked = !location.locked
		console.log("Location lock toggled:", location.locked)
		if (location.locked) {
			map.value?.flyTo({
				center: [location.lng, location.lat],
				zoom: 16,
				duration: 1000,
				// bearing: location.heading !== null ? location.heading : undefined
			}, {
				reason: "location"
			})
		}
	},
	advertiser: null as WebSocket | null,
	code: null as string | null,
	lastUpdate: null as Date | null
})

export function watchLocation() {
	if(navigator.geolocation) {
		navigator.geolocation.watchPosition((pos) => {
			if(location.provider !== "gps") return;
			// console.log("Geolocation update:", pos)
			location.lat = pos.coords.latitude
			location.lng = pos.coords.longitude
			location.accuracy = pos.coords.accuracy
			location.speed = pos.coords.speed || 0
			location.available = true
			location.heading = pos.coords.heading
			location.lastUpdate = new Date()
	
			if (location.locked) {
				map.value?.flyTo({
					center: [location.lng, location.lat],
					zoom: 16,
					duration: 1000,
					// bearing: location.heading !== null ? location.heading : undefined
				}, {
					reason: "location"
				})
			}

			// console.log(location.advertiser);
	
			if (location.advertiser) {
				location.advertiser.send(JSON.stringify({
					type: "location",
					location: {
						lat: location.lat,
						lng: location.lng,
						accuracy: location.accuracy,
						speed: location.speed,
						heading: location.heading
					},
					route: {
						trip: routing.currentTrip,
						info: routing.currentTripInfo,
						geojson: routing.geojson
					}
				}))
			}
		}, (err) => {
			console.error("Geolocation error:", err)
		}, {
			enableHighAccuracy: true
		})
	}
}

let checkRunning = false;

if(!checkRunning) {
	setInterval(() => {
		checkRunning = true;
		if(location.provider !== "gps") return;
		// If the last update was more than 5 seconds ago, recall watchPosition
		// console.log("Checking location update status")
		if (location.lastUpdate && (new Date().getTime() - location.lastUpdate.getTime()) > 10000) {
			console.warn("Location update is stale, rewatching position")
			watchLocation();
		}
	}, 1000)
	checkRunning = true;
}

watchLocation()

export function advertiseRemoteLocation(code?: string) {
	const ws = new WebSocket(
		`${LNV_SERVER.replace("https", "wss").replace("http", "ws")}/ws`
	);
	ws.addEventListener("open", () => {
		console.log("WebSocket connection established for remote location advertisement")
		ws.send(JSON.stringify({ type: "advertise", code }))
	});
	ws.addEventListener("message", (event) => {
		const data = JSON.parse(event.data);
		console.log("WebSocket message received:", data);

		if (data.type === "advertising") {
			console.log("Advertising code:", data.code);
			// alert(`You are now advertising your location with code: ${data.code}`);
			location.locked = true; // Lock the location when advertising
			location.advertiser = ws; // Store the WebSocket for sending location updates
			location.code = data.code; // Store the advertising code
		} else if (data.type === "error") {
			console.error("WebSocket error:", data.message);
		}
	});
}

export function remoteLocation(code: string) {
	// Open websocket connection
	// Use LNV_SERVER, change to ws or wss based on protocol
	const ws = new WebSocket(
		`${LNV_SERVER.replace("https", "wss").replace("http", "ws")}/ws`
	);
	ws.addEventListener("open", () => {
		console.log("WebSocket connection established for remote location")
		ws.send(JSON.stringify({ type: "subscribe", code }))
		location.provider = "remote"
		location.code = code
	})
	ws.addEventListener("message", (event) => {
		const data = JSON.parse(event.data)
		if (data.type === "location") {
			console.log("Remote location update:", data.location)
			location.lat = data.location.lat
			location.lng = data.location.lng
			location.accuracy = data.location.accuracy
			location.speed = data.location.speed || 0
			location.available = true
			location.heading = data.location.heading || null
			routing.currentTrip = data.route.trip || null
			routing.currentTripInfo = data.route.info || null
			routing.geojson = data.route.geojson || null

			if (location.locked) {
				map.value?.flyTo({
					center: [location.lng, location.lat],
					zoom: 16,
					duration: 1000,
					// bearing: location.heading !== null ? location.heading : undefined
				}, {
					reason: "location"
				})
			}
		}
	})
}

// setInterval(() => {
// 	// Move location towards heading (if available) at speed
// 	// if (location.provider !== "simulated" || location.locked) return;
// 	if (location.heading !== null && location.speed > 0) {
// 		const rad = (location.heading * Math.PI) / 180
// 		const distance = location.speed / 3600 // Convert speed from km/h to km/s
// 		location.lat += (distance * Math.cos(rad)) / 111.32 // Approximate conversion from degrees to km
// 		location.lng += (distance * Math.sin(rad)) / (111.32 * Math.cos((location.lat * Math.PI) / 180)) // Adjust for longitude
// 		location.accuracy = 5 // Simulated accuracy
// 		location.available = true

// 		map.value?.flyTo({
// 			center: [location.lng, location.lat],
// 			zoom: 16,
// 			duration: 1000
// 		})
// 	}
// }, 100)
