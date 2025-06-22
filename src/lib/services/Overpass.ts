import { OVERPASS_SERVER } from "./hosts";

export interface OverpassResult {
	elements: OverpassElement[];
}

export interface OverpassElement {
	type: "node" | "way" | "relation";
	id: number;
	tags: Record<string, string>;
	lat?: number; // Only for nodes
	lon?: number; // Only for nodes
	nodes?: number[]; // Only for ways
	center?: {
		lat: number; // Only for relations
		lon: number; // Only for relations
	};
}

/**
[out:json];
{{geocodeArea:<City>}}->.searchArea;
// nwr(area.searchArea);
(
  node(area.searchArea)["amenity"]["name"];
  way(area.searchArea)["amenity"]["name"];
  relation(area.searchArea)["amenity"]["name"];
  node(area.searchArea)["shop"]["name"];
  way(area.searchArea)["shop"]["name"];
  relation(area.searchArea)["shop"]["name"];
  node(area.searchArea)["building"]["building"!="garage"];
  way(area.searchArea)["building"]["building"!="garage"];
  node(area.searchArea)["amenity"="parking"];
  way(area.searchArea)["amenity"="parking"];
);
out geom;

[out:json];
{{geocodeArea:<City>}};
out geom;
 */

export async function fetchPOI(lat: number, lon: number, radius: number) {
	return await fetch(OVERPASS_SERVER, {
		method: "POST",
		body: `[out:json];
(
  node(around:${radius}, ${lat}, ${lon})["amenity"]["name"];
  way(around:${radius}, ${lat}, ${lon})["amenity"]["name"];
  relation(around:${radius}, ${lat}, ${lon})["amenity"]["name"];
  node(around:${radius}, ${lat}, ${lon})["shop"]["name"];
  way(around:${radius}, ${lat}, ${lon})["shop"]["name"];
  relation(around:${radius}, ${lat}, ${lon})["shop"]["name"];
  node(around:${radius}, ${lat}, ${lon})["building"]["building"!="garage"];
  way(around:${radius}, ${lat}, ${lon})["building"]["building"!="garage"];
  node(around:${radius}, ${lat}, ${lon})["amenity"="parking"];
  way(around:${radius}, ${lat}, ${lon})["amenity"="parking"];
);
out center tags;`,
	}).then((res) => res.json() as Promise<OverpassResult>);
}
