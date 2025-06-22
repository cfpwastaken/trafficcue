<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import type { Snippet } from "svelte";
	import { view } from "../sidebar.svelte";

	let {
		children,
		onback,
	}: {
		children: Snippet;
		onback?: () => void;
	} = $props();
</script>

<div class="flex gap-2 items-center mb-2">
	<Button
		variant="outline"
		onclick={() => {
			view.back();
			if (onback) {
				onback();
			}
		}}>&lt;</Button
	>
	<h2 class="text-lg font-bold flex gap-2 items-center">
		{@render children?.()}
	</h2>
</div>
