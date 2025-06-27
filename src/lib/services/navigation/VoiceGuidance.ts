import { OVERPASS_SERVER } from "../hosts";
import type { OverpassResult } from "../Overpass";

export async function generateVoiceGuidance(maneuver: Maneuver, shape: WorldLocation[]): Promise<string> {
	if(maneuver.begin_shape_index == 0) {
		return maneuver.verbal_pre_transition_instruction;
	}

	if(maneuver.type === 26 || maneuver.type === 27) {
		return `Im Kreisverkehr die ${maneuver.roundabout_exit_count}te Ausfahrt nehmen${(maneuver.street_names ?? []).length == 0 ? "." : ` auf ${(maneuver.street_names || []).join(", ")}.`}`;
	}

	const landmarks = await findNearbyLandmarks(shape[maneuver.begin_shape_index]);
	if(landmarks.length == 0) {
		return maneuver.verbal_pre_transition_instruction;
	}
	console.log("Original instruction:", maneuver.verbal_pre_transition_instruction);
	return `Hinter ${landmarks[0].tags.name}, ${typeToName(maneuver.type)}${(maneuver.street_names ?? []).length == 0 ? "." : ` auf ${(maneuver.street_names || []).join(", ")}.`}`;
}

function typeToName(type: number) {
	switch (type) {
		case 4:
			return "Ziel erreicht";
		case 5:
			return "Ziel auf der rechten Seite erreicht";
		case 6:
			return "Ziel auf der linken Seite erreicht";
		case 8:
			return "Weiterfahren";
		case 9:
			return "Leicht rechts abbiegen";
		case 10:
			return "Rechts abbiegen";
		case 11:
			return "Scharf rechts abbiegen";
		case 12:
		case 13:
			return "Umdrehen";
		case 14:
			return "Scharf links abbiegen";
		case 15:
			return "Links abbiegen";
		case 16:
			return "Leicht links abbiegen";
		case 20:
			return "Rechts abfahren";
		case 21:
			return "Links abfahren";
		case 22:
			return "Geradeaus weiterfahren";
		case 23:
			return "Rechts halten";
		case 24:
			return "Links halten";
		case 25:
			return "Einordnen";
		// case 26:
		// case 27:
		// 	return "Kreisverkehr";
		case 37:
			return "Rechts einordnen";
		case 38:
			return "Links einordnen";
		default:
			return "Unbekannt";
	}
}

export async function findNearbyLandmarks(location: WorldLocation) {
	const radius = 100;
	const lat = location.lat;
	const lon = location.lon;
	const res = await fetch(OVERPASS_SERVER, {
			method: "POST",
			body: `[out:json];
	(
		node(around:${radius}, ${lat}, ${lon})["amenity"="fuel"]["name"];
		way(around:${radius}, ${lat}, ${lon})["amenity"="fuel"]["name"];
		node(around:${radius}, ${lat}, ${lon})["tourism"="artwork"]["name"];
		way(around:${radius}, ${lat}, ${lon})["tourism"="artwork"]["name"];
		node(around:${radius}, ${lat}, ${lon})["shop"]["name"];
		way(around:${radius}, ${lat}, ${lon})["shop"]["name"];
	);
	out center tags;`,
		}).then((res) => res.json() as Promise<OverpassResult>);
	// Sort by distance to the location
	return res.elements.sort((a, b) => {
		const distA = Math.sqrt(Math.pow(a.lat! - lat, 2) + Math.pow(a.lon! - lon, 2));
		const distB = Math.sqrt(Math.pow(b.lat! - lat, 2) + Math.pow(b.lon! - lon, 2));
		return distA - distB;
	});
}
