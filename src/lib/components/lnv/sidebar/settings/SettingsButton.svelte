<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { IconProps } from "@lucide/svelte";
	import type { Component } from "svelte";
	import { view } from "../../view.svelte";
	import Progress from "$lib/components/ui/progress/progress.svelte";

	const {
		icon: Icon,
		text,
		view: viewName,
		onclick,
		disabled,
		progress,
	}: {
		icon: Component<IconProps>;
		text: string;
		view?: string;
		onclick?: () => void;
		disabled?: boolean;
		progress?: number;
	} = $props();
</script>

<Button
	variant="secondary"
	style="width: 100%; height: 40px;"
	{disabled}
	onclick={() => {
		if (viewName) view.switch(viewName);
		if (onclick) onclick();
	}}
>
	<Icon />
	{text}
	{#if progress == -1}
		<div style="width: 100%;"></div>
	{:else if progress}
		<Progress value={progress} />
	{/if}
</Button>
