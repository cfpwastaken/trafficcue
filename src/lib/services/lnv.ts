import { LNV_SERVER } from "./hosts";

export type Capabilities = ("auth" | "reviews" | "ai" | "fuel")[];
export let capabilities: Capabilities = [];
export let oidcConfig: { AUTH_URL: string; CLIENT_ID: string; TOKEN_URL: string } | null = null;

export async function fetchConfig() {
	const res = await fetch(LNV_SERVER + "/config");
	if (!res.ok) {
		throw new Error(`Failed to fetch capabilities: ${res.statusText}`);
	}
	const data = await res.json();
	return data as { name: string; version: string; capabilities: Capabilities; oidc?: { AUTH_URL: string; CLIENT_ID: string; TOKEN_URL: string } };
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
			TOKEN_URL: config.oidc.TOKEN_URL
		};
	}
	return oidcConfig;
}

export async function hasCapability(capability: Capabilities[number]): Promise<boolean> {
	const caps = await getCapabilities();
	return caps.includes(capability);
}

export type Review = {
	user_id: string;
	username: string;
	rating: number;
	comment: string;
}
export async function getReviews(location: WorldLocation) {
	if(!await hasCapability("reviews")) {
		throw new Error("Reviews capability is not available");
	}
	const res = await fetch(LNV_SERVER + `/reviews?lat=${location.lat}&lon=${location.lon}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch reviews: ${res.statusText}`);
	}
	const data = await res.json();
	return data as Review[];
}

export async function postReview(location: WorldLocation, review: Omit<Review, 'user_id' | 'username'>) {
	if(!await hasCapability("reviews")) {
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
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			...review,
			lat: location.lat,
			lon: location.lon
		})
	});
	if (!res.ok) {
		throw new Error(`Failed to post review: ${res.statusText}`);
	}
	return await res.json();
}

export async function ai(query: string, location?: WorldLocation) {
	if(!await hasCapability("ai")) {
		throw new Error("AI capability is not available");
	}
	const res = await fetch(LNV_SERVER + `/ai`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: query,
			coords: location
		})
	});
	if (!res.ok) {
		throw new Error(`Failed to get AI response: ${res.statusText}`);
	}
	return await res.text();
}
