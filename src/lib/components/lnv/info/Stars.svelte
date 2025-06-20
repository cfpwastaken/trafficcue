<script lang="ts">
	import { StarIcon } from "@lucide/svelte";

	let { rating }: { rating: number } = $props();
</script>

{#if rating == 0}
	<StarIcon />
	<StarIcon />
	<StarIcon />
	<StarIcon />
	<StarIcon />
{:else if rating == 1}
	<StarIcon class="fill-white" />
	<StarIcon />
	<StarIcon />
	<StarIcon />
	<StarIcon />
{:else if rating == 2}
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon />
	<StarIcon />
	<StarIcon />
{:else if rating == 3}
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon />
	<StarIcon />
{:else if rating == 4}
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon />
{:else if rating == 5}
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
	<StarIcon class="fill-white" />
{/if}