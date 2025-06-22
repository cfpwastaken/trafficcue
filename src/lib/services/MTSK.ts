import { LNV_SERVER } from "./hosts";
import { hasCapability } from "./lnv";

interface Station {
	id: string;
	name: string;
	brand: string;
	street: string;
	place: string;
	lat: number;
	lng: number;
	dist: number;
	diesel: number | false;
	e5: number | false;
	e10: number | false;
	isOpen: boolean;
	houseNumber: string;
	postCode: number;
}

interface StationsResponse {
	ok: boolean;
	license: "CC BY 4.0 -  https://creativecommons.tankerkoenig.de";
	data: "MTS-K";
	status: string;
	stations: Station[];
}

type StationDetails = {
	openingTimes: StationOpeningTime[];
	overrides: string[];
	wholeDay: boolean;
} & Station;

interface StationOpeningTime {
	text: string;
	start: string;
	end: string;
}

interface StationDetailsResponse {
	ok: boolean;
	license: "CC BY 4.0 -  https://creativecommons.tankerkoenig.de";
	data: "MTS-K";
	status: string;
	station: StationDetails;
}

export async function getStations(
	lat: number,
	lon: number,
): Promise<StationsResponse> {
	if (!(await hasCapability("fuel"))) {
		throw new Error("Fuel capability is not available");
	}
	return await fetch(
		`${LNV_SERVER}/fuel/list?lat=${lat}&lng=${lon}&rad=1&sort=dist&type=all`,
	).then((res) => res.json());
}

export async function getPrices(id: string) {
	// TODO: add type
	if (!(await hasCapability("fuel"))) {
		throw new Error("Fuel capability is not available");
	}
	return await fetch(`${LNV_SERVER}/fuel/prices?ids=${id}`).then((res) =>
		res.json(),
	);
}

export async function getStationDetails(
	id: string,
): Promise<StationDetailsResponse> {
	if (!(await hasCapability("fuel"))) {
		throw new Error("Fuel capability is not available");
	}
	return await fetch(`${LNV_SERVER}/fuel/detail?id=${id}`).then((res) =>
		res.json(),
	);
}
