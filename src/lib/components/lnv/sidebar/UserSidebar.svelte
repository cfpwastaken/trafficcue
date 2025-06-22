<script lang="ts">
	import { onMount } from "svelte";
	import SidebarHeader from "./SidebarHeader.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { getAuthURL, getOIDCUser } from "$lib/services/oidc";
	import * as Avatar from "$lib/components/ui/avatar";

	let user: any = $state(null);

	onMount(() => {
		if(!localStorage.getItem("lnv-token")) {
			user = null;
		} else {
			user = JSON.parse(atob((localStorage.getItem("lnv-id") || "").split(".")[1]));
		}
	})
</script>

{#if !user}
	<SidebarHeader>
		User
	</SidebarHeader>

	<Button onclick={async () => {
		const auth = await getAuthURL();
		// localStorage.setItem("lnv-codeVerifier", auth.codeVerifier);
		// localStorage.setItem("lnv-oidcstate", auth.state);
		const popup = window.open(auth.url, "Login", "width=500,height=600");
		window.addEventListener("message", async (e) => {
			if(e.origin !== window.location.origin) return;

			const { code, state } = e.data;
			console.log("Received data from popup:", e.data);
			if(!code || !state) {
				console.error("Invalid response from popup");
				return;
			}
			popup?.close();
			if(state !== auth.state) {
				alert("State mismatch. Please try again.");
				return;
			}

			const token = await getOIDCUser(code, auth.codeVerifier);
			localStorage.setItem("lnv-id", token.id_token);
			localStorage.setItem("lnv-token", token.access_token);
			localStorage.setItem("lnv-refresh", token.refresh_token);
			user = JSON.parse(atob((localStorage.getItem("lnv-id") || "").split(".")[1]));
		})
	}}>Login</Button>
{:else}
	<SidebarHeader>
		<Avatar.Root>
			<Avatar.Image src={user.picture} />
			<Avatar.Fallback>{user.preferred_username}</Avatar.Fallback>
		</Avatar.Root>
		{user.name || user.preferred_username}
	</SidebarHeader>
	<pre>{user.sub}</pre>
	{JSON.stringify(user, null, 2)}
{/if}