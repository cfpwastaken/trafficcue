// OIDC Server needs to have redirect url for /login/callback

import { getOIDCConfig, hasCapability } from "./lnv";

export async function getAuthURL() {
	if (!(await hasCapability("auth"))) {
		throw new Error("Server does not support OIDC authentication");
	}
	const oidcConfig = await getOIDCConfig();
	if (!oidcConfig) {
		throw new Error("Server does not support OIDC authentication");
	}
	const { AUTH_URL, CLIENT_ID } = oidcConfig;

	const pkce = await generatePKCEChallenge();

	const state = generateRandomString(16);

	return {
		url: `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${window.location.origin}/oidc&scope=openid%20profile&code_challenge=${pkce.codeChallenge}&code_challenge_method=S256&state=${state}`,
		codeVerifier: pkce.codeVerifier,
		state,
	};
}

// Function to generate PKCE code challenge
// With the S256 method
async function generatePKCEChallenge() {
	const codeVerifier = generateRandomString(128);
	const codeChallengeBuf = await sha256(codeVerifier);
	const codeChallenge = base64URLEncode(new Uint8Array(codeChallengeBuf));

	return { codeVerifier, codeChallenge };
}

// Generates a cryptographically secure random string

function generateRandomString(length: number) {
	const array = new Uint32Array(length / 2);

	window.crypto.getRandomValues(array);

	return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
		"",
	);
}

// Encodes a string to base64url (no padding)
function base64URLEncode(buffer: Uint8Array) {
	return btoa(String.fromCharCode(...buffer))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function sha256(input: string | undefined): Promise<ArrayBuffer> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);

	return await window.crypto.subtle.digest("SHA-256", data);
}

export interface OIDCUser {
	access_token: string;
	token_type: string;
	refresh_token: string;
	expires_in: number;
	id_token: string;
}

export async function getOIDCUser(code: string, codeVerifier: string) {
	if (!(await hasCapability("auth"))) {
		throw new Error("Server does not support OIDC authentication");
	}
	const oidcConfig = await getOIDCConfig();
	if (!oidcConfig) {
		throw new Error("Server does not support OIDC authentication");
	}
	const { CLIENT_ID, TOKEN_URL } = oidcConfig;

	const params = new URLSearchParams();
	params.append("grant_type", "authorization_code");
	params.append("code", code);
	params.append("client_id", CLIENT_ID);
	params.append("code_verifier", codeVerifier);
	params.append("redirect_uri", window.location.origin + "/oidc");

	const res = await fetch(TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params,
	}).then((res) => res.json());

	return res as OIDCUser;
	// return JSON.parse(atob(id_token.split(".")[1]));
}
