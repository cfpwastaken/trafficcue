<script>
	import { EVConnectors } from "$lib/vehicles/vehicles.svelte";
	import * as Select from "../ui/select";
</script>

{#each EVConnectors as connector (connector)}
	<Select.Item value={connector}>
		{connector}
	</Select.Item>
{/each}
