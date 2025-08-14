<script>
	import Badge from "$lib/components/ui/badge/badge.svelte";

	let { tags } = $props();

	const TAGS = [
		"cuisine",
		"indoor_seating",
		"outdoor_seating",
		"takeaway",
		"drive_through",
	];

	const matchingTags = TAGS.filter((tag) => tag in tags);
</script>

{#if matchingTags.length > 0}
	<h3 class="text-lg font-bold mt-2">Restaurant</h3>
	<ul class="flex gap-2 flex-wrap">
		{#each matchingTags as tag, _index (tag)}
			{#if tag != "no"}
				<Badge>
					{tag}{tags[tag] == "yes" ? "" : ": " + tags[tag]}
				</Badge>
			{/if}
		{/each}
	</ul>
{/if}
