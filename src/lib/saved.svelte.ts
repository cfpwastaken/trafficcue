import { reverseGeocode } from "./services/Search";

export const saved: Record<string, WorldLocation> = $state(
	JSON.parse(localStorage.getItem("saved") ?? "{}"),
);

export function saveLocations() {
	localStorage.setItem("saved", JSON.stringify(saved));
}

export async function geocode(name: string) {
	const loc = saved[name];
	if(!loc) return;
	const geocode = await reverseGeocode(loc);
	if(geocode.length == 0) {
		return;
	}
	const feature = geocode[0];
	return `${feature.properties.street}${feature.properties.housenumber ? (" " + feature.properties.housenumber) : ""}, ${feature.properties.city}`;
}
