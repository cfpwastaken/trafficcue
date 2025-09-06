export const MAP_SERVER = "https://tiles.openfreemap.org/styles/liberty";
// export const MAP_SERVER = "https://tiles.map.picoscratch.de/styles/ofm/liberty.json";
export const ROUTING_SERVER = "https://valhalla1.openstreetmap.de/";
// export const ROUTING_SERVER = "https://routing.map.picoscratch.de";
export const SEARCH_SERVER = "https://photon.komoot.io/";
export const OVERPASS_SERVER = "https://overpass-api.de/api/interpreter";
export const LNV_SERVER =
	location.hostname == "localhost" && location.protocol == "http:"
		? "http://localhost:3000/api"
		: location.hostname.includes("staging")
		? "https://staging-trafficcue-api.picoscratch.de/api"
		: "https://trafficcue-api.picoscratch.de/api";
