<script lang="ts">
	import LaneDisplay from "./LaneDisplay.svelte";

	let { lanes }: { lanes: Lane[] | undefined } = $props();
</script>

{#if lanes}
	<div id="lanes">
		{#each lanes as lane}
			<LaneDisplay {lane} />
		{/each}
	</div>
{/if}

<style>
	#lanes {
		background-color: hsl(0, 0%, 10%, 0.6);
		padding: 10px;
		display: flex;
		justify-content: space-around;
	}
</style>