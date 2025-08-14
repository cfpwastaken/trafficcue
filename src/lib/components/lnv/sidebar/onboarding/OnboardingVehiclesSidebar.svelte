<script>
	import { m } from "$lang/messages";
	import { PlusCircleIcon } from "@lucide/svelte";
	import { view } from "../../view.svelte";
	import AddVehicleDrawer from "../../AddVehicleDrawer.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { setOnboardingState } from "$lib/onboarding.svelte";
</script>

<h1 style="font-size: 1.3em; font-weight: bold; margin-bottom: 1rem;">
	{m["sidebar.onboarding.first-vehicle"]()}
</h1>

<AddVehicleDrawer>
	<Button variant="secondary" class="w-full p-5">
		<PlusCircleIcon />
		{m["vehicles.selector.add"]()}
	</Button>
</AddVehicleDrawer>

<Button
	style="margin-top: 1rem; width: 100%;"
	onclick={() => {
		setOnboardingState("end");
		view.switch("offline-maps");
		view.history = [{ type: "main" }];
	}}>{m.next()}</Button
>
