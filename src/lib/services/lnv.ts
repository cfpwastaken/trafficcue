import { LNV_SERVER } from "./hosts";
import type { OIDCUser } from "./oidc";

export type Capabilities = (
	| "auth"
	| "reviews"
	| "ai"
	| "fuel"
	| "post"
	| "saved-routes"
)[];
export let capabilities: Capabilities = [];
export let oidcConfig: {
	AUTH_URL: string;
	CLIENT_ID: string;
	TOKEN_URL: string;
} | null = null;

export async function fetchConfig() {
	const res = await fetch(LNV_SERVER + "/config");
	if (!res.ok) {
		throw new Error(`Failed to fetch capabilities: ${res.statusText}`);
	}
	const data = await res.json();
	return data as {
		name: string;
		version: string;
		capabilities: Capabilities;
		oidc?: { AUTH_URL: string; CLIENT_ID: string; TOKEN_URL: string };
	};
}

export async function getCapabilities() {
	if (capabilities.length === 0) {
		const config = await fetchConfig();
		capabilities = config.capabilities;
	}
	return capabilities;
}

export async function getOIDCConfig() {
	if (oidcConfig) {
		return oidcConfig;
	}
	const config = await fetchConfig();
	if (config.oidc) {
		oidcConfig = {
			AUTH_URL: config.oidc.AUTH_URL,
			CLIENT_ID: config.oidc.CLIENT_ID,
			TOKEN_URL: config.oidc.TOKEN_URL,
		};
	}
	return oidcConfig;
}

export async function hasCapability(
	capability: Capabilities[number],
): Promise<boolean> {
	const caps = await getCapabilities();
	return caps.includes(capability);
}

export async function uploadID() {
	const res = await fetch(LNV_SERVER + "/user", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			token: localStorage.getItem("lnv-id"),
		}),
	});
	if (!res.ok) {
		alert("Failed to upload user data.");
	}
}

export async function refreshToken() {
	const config = await getOIDCConfig();
	if (!config) throw new Error("Server does not support OIDC.");
	const refresh_token = localStorage.getItem("lnv-refresh");
	if (!refresh_token) throw new Error("No refresh token.");
	const params = new URLSearchParams();
	params.append("grant_type", "refresh_token");
	params.append("refresh_token", refresh_token);
	params.append("client_id", config.CLIENT_ID);
	const res = await fetch(config.TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params,
	});
	const data = (await res.json()) as OIDCUser;
	if (!res.ok) {
		console.error("Refreshing token: " + res.status + " " + res.statusText);
		console.error(data);
	}
	console.log(data);
	localStorage.setItem("lnv-id", data.id_token);
	localStorage.setItem("lnv-token", data.access_token);
	localStorage.setItem("lnv-refresh", data.refresh_token);
	await uploadID();
}

export async function authFetch(
	url: string,
	params?: RequestInit,
): ReturnType<typeof fetch> {
	let res = await fetch(url, {
		headers: {
			Authorization: "Bearer " + localStorage.getItem("lnv-token"),
		},
		...params,
	});
	if (res.status != 401) {
		return res;
	}
	await refreshToken();
	res = await fetch(url, {
		headers: {
			Authorization: "Bearer " + localStorage.getItem("lnv-token"),
		},
		...params,
	});
	if (res.status == 401) {
		console.error("Server is misconfigured.");
	}
	return res;
}

export interface Review {
	user_id: string;
	username: string;
	rating: number;
	comment: string;
}
export async function getReviews(location: WorldLocation) {
	if (!(await hasCapability("reviews"))) {
		throw new Error("Reviews capability is not available");
	}
	const res = await fetch(
		LNV_SERVER + `/reviews?lat=${location.lat}&lon=${location.lon}`,
	);
	if (!res.ok) {
		throw new Error(`Failed to fetch reviews: ${res.statusText}`);
	}
	const data = await res.json();
	return data as Review[];
}

export async function postReview(
	location: WorldLocation,
	review: Omit<Review, "user_id" | "username">,
) {
	if (!(await hasCapability("reviews"))) {
		throw new Error("Reviews capability is not available");
	}
	const token = localStorage.getItem("lnv-token");
	if (!token) {
		throw new Error("User is not authenticated");
	}
	const res = await fetch(LNV_SERVER + `/review`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			...review,
			lat: location.lat,
			lon: location.lon,
		}),
	});
	if (!res.ok) {
		throw new Error(`Failed to post review: ${res.statusText}`);
	}
	return await res.json();
}

export async function ai(query: string, location?: WorldLocation) {
	if (!(await hasCapability("ai"))) {
		throw new Error("AI capability is not available");
	}
	const res = await fetch(LNV_SERVER + `/ai`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: query,
			coords: location,
		}),
	});
	if (!res.ok) {
		throw new Error(`Failed to get AI response: ${res.statusText}`);
	}
	return await res.text();
}

export function getSaved(): Promise<{ name: string; data: string }[]> {
	return authFetch(LNV_SERVER + "/saved").then((res) => res.json());
}

export function putSaved(name: string, data: object) {
	return authFetch(LNV_SERVER + "/saved", {
		method: "PUT",
		body: JSON.stringify({
			name,
			data: JSON.stringify(data),
		}),
	}).then((res) => res.json());
}

export function deleteSaved(name: string) {
	return authFetch(LNV_SERVER + "/saved", {
		method: "DELETE",
		body: JSON.stringify({
			name,
		}),
	}).then((res) => res.text());
}

export async function isSaved(data: Trip) {
	const res = await getSaved();
	console.log(res, data);
	const filtered = res.filter(
		(s) => JSON.parse(s.data).legs[0].shape == data.legs[0].shape,
	);
	if (filtered.length == 0) return false;
	return filtered[0].name;
}
