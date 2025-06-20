// import { Contacts } from "@capacitor-community/contacts";
import { SEARCH_SERVER } from "./hosts";
// import { Capacitor } from "@capacitor/core";

export type Feature = {
	type: "Feature",
	geometry: {
		coordinates: [number, number],
		type: "Point"
	},
	properties: {
		osm_key: string;
		osm_value: string;
		osm_id: number,
		city: string,
		country: string,
		name: string,
		street: string,
		housenumber: string,
		type: string,
		// There is more, but not needed atm
	}
}

export async function searchPlaces(query: string, lat: number, lon: number): Promise<Feature[]> {
	const res = await fetch(SEARCH_SERVER + "/api/?q=" + query + "&lat=" + lat + "&lon=" + lon).then((res) => res.json());
	return res.features;
}

export async function reverseGeocode(coord: WorldLocation): Promise<Feature[]> {
	const res = await fetch(SEARCH_SERVER + "/reverse?lat=" + coord.lat + "&lon=" + coord.lon).then((res) => res.json());
	return res.features;
}

export async function search(query: string, lat: number, lon: number): Promise<Feature[]> {
	if(query.startsWith("@")) {
		// if(Capacitor.isNativePlatform()) {
		// 	return await searchContacts(query, lat, lon);
		// }
		return [];
	} else {
		return await searchPlaces(query, lat, lon);
	}
}

// export async function searchContacts(query: string, lat: number, lon: number): Promise<Feature[]> {
// 	console.log("Fetching contacts");
// 	const allContacts = await Contacts.getContacts({
// 		projection: {
// 			name: true,
// 			postalAddresses: true
// 		}
// 	});
// 	console.log("Got contacts");
// 	console.log(allContacts.contacts.map((contact) => contact.name?.display + " " + contact.postalAddresses?.[0]?.street));
// 	const contacts = allContacts.contacts.filter((contact) => {
// 		return contact.name?.display?.toLowerCase().includes(query.substring(1).toLowerCase());
// 	});
// 	console.log(contacts.map((contact) => contact.name?.display + " " + contact.postalAddresses?.[0]?.street));
// 	const res = [];
// 	for (const contact of contacts) {
// 		const address = contact.postalAddresses?.[0];
// 		if (!address) continue;
// 		console.log("Fetching addr for " + contact.name?.display);
// 		// Search for the address
// 		const addressString = (address.street || "") + " " + (address.city || "") + " " + (address.country || "");
// 		const addressRes = await searchPlaces(addressString, lat, lon);
// 		console.log(addressRes);
// 		if (addressRes.length > 0) {
// 			const feature = addressRes[0];
// 			feature.properties.name = contact.name?.display || "";
// 			res.push(feature);
// 		}
// 	}
// 	return res;
// }
